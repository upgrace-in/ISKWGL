import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import CloudAccount from '@/models/CloudAccount';
import VirtualItem from '@/models/VirtualItem';
import { decryptCreds, encryptCreds } from '@/app/lib/providers';

const DRIVE_TIMEOUT_MS = 20000;

async function refreshGoogleAccessTokenIfNeeded(account, creds) {
  if (!creds?.refresh_token) return creds;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      refresh_token: creds.refresh_token,
      grant_type: 'refresh_token',
    }),
    signal: AbortSignal.timeout(DRIVE_TIMEOUT_MS),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Google token refresh failed (${res.status}): ${JSON.stringify(data)}`);
  }

  const updated = { ...creds, access_token: data.access_token };
  account.encryptedCredentials = encryptCreds(updated);
  await account.save();
  return updated;
}

async function collectDescendantIds(rootId) {
  const toDelete = [rootId];
  const queue = [rootId];

  while (queue.length > 0) {
    const batchParents = queue.splice(0, queue.length);
    const children = await VirtualItem.find({ parentId: { $in: batchParents } }, { _id: 1 }).lean();
    for (const child of children) {
      const childIdStr = String(child._id);
      toDelete.push(childIdStr);
      queue.push(childIdStr);
    }
  }

  return toDelete;
}

export async function DELETE(req, context) {
  try {
    const resolvedParams = await context.params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const moveToTrash = searchParams.get('trash') === 'true';

    await dbConnect();

    const item = await VirtualItem.findById(id);
    if (!item) {
      return NextResponse.json({ error: 'Item not found in database' }, { status: 404 });
    }

    const account = await CloudAccount.findById(item.accountId);
    if (!account) {
      return NextResponse.json({ error: 'Linked cloud account not found' }, { status: 404 });
    }

    const cloudTargetId = item.remoteId;

    if (account.provider === 'gdrive' && cloudTargetId) {
      let creds = decryptCreds(account.encryptedCredentials);
      creds = await refreshGoogleAccessTokenIfNeeded(account, creds);
      const authHeaders = { Authorization: `Bearer ${creds.access_token}` };

      // Inspect ownership and capabilities before deleting
      const metaRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(cloudTargetId)}?supportsAllDrives=true&fields=id,name,ownedByMe,owners(emailAddress),capabilities(canDelete,canTrash)`,
        {
          headers: authHeaders,
          signal: AbortSignal.timeout(DRIVE_TIMEOUT_MS),
        }
      );

      if (metaRes.ok) {
        const meta = await metaRes.json();
        const ownerEmail =
          Array.isArray(meta.owners) && meta.owners.length > 0
            ? meta.owners[0].emailAddress || 'Unknown owner'
            : 'Unknown owner';
        const canTrash = Boolean(meta.capabilities?.canTrash);

        if (meta.ownedByMe === false) {
          if (!moveToTrash) {
            return NextResponse.json(
              {
                error: 'This item is not owned by you, so you cannot permanently delete it.',
                notOwned: true,
                ownerEmail,
                canTrash,
              },
              { status: 403 }
            );
          }

          if (!canTrash) {
            return NextResponse.json(
              {
                error: 'This item is not owned by you and cannot be moved to trash.',
                notOwned: true,
                ownerEmail,
                canTrash: false,
              },
              { status: 403 }
            );
          }

          const trashRes = await fetch(
            `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(cloudTargetId)}?supportsAllDrives=true`,
            {
              method: 'PATCH',
              headers: {
                ...authHeaders,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ trashed: true }),
              signal: AbortSignal.timeout(DRIVE_TIMEOUT_MS),
            }
          );

          if (!trashRes.ok && trashRes.status !== 404) {
            const errText = await trashRes.text();
            return NextResponse.json(
              { error: `Failed to move item to trash (${trashRes.status}): ${errText}` },
              { status: trashRes.status }
            );
          }
        } else {
          // Owned by current user -> permanent delete (or trash if explicitly requested)
          const driveRes = await fetch(
            `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(cloudTargetId)}?supportsAllDrives=true`,
            moveToTrash
              ? {
                  method: 'PATCH',
                  headers: {
                    ...authHeaders,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ trashed: true }),
                  signal: AbortSignal.timeout(DRIVE_TIMEOUT_MS),
                }
              : {
                  method: 'DELETE',
                  headers: authHeaders,
                  signal: AbortSignal.timeout(DRIVE_TIMEOUT_MS),
                }
          );

          if (!driveRes.ok && driveRes.status !== 404) {
            const errText = await driveRes.text();
            return NextResponse.json(
              { error: `Failed to delete from Google Drive (${driveRes.status}): ${errText}` },
              { status: driveRes.status }
            );
          }
        }
      } else if (metaRes.status !== 404) {
        const errText = await metaRes.text();
        return NextResponse.json(
          { error: `Failed to inspect file metadata on Google Drive (${metaRes.status}): ${errText}` },
          { status: metaRes.status }
        );
      }
    } else if (account.provider !== 'gdrive') {
      return NextResponse.json(
        { error: `Cloud deletion not yet implemented for provider "${account.provider}"` },
        { status: 501 }
      );
    }

    const idsToDelete =
      item.type === 'folder' ? await collectDescendantIds(String(item._id)) : [String(item._id)];

    const deletedDocs = await VirtualItem.find({ _id: { $in: idsToDelete } }).lean();
    const freedBytes = deletedDocs.reduce(
      (sum, doc) => sum + (doc.type === 'file' ? Number(doc.sizeBytes || 0) : 0),
      0
    );

    await VirtualItem.deleteMany({ _id: { $in: idsToDelete } });

    if (freedBytes > 0) {
      const freedGB = freedBytes / 1024 ** 3;
      account.usedGB = Number(Math.max(0, Number(account.usedGB || 0) - freedGB).toFixed(3));
      await account.save();
    }

    return NextResponse.json({
      ok: true,
      trashed: moveToTrash,
      deletedIds: idsToDelete,
      usedGB: account.usedGB,
    });
  } catch (err) {
    console.error('[delete] error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to delete item' },
      { status: 500 }
    );
  }
}