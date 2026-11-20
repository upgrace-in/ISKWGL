import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import CloudAccount from '@/models/CloudAccount';
import VirtualItem from '@/models/VirtualItem';
import { decryptCreds, encryptCreds } from '@/app/lib/providers';

const DRIVE_TIMEOUT_MS = 20000;

function isPhotoItem(item, effectiveMime) {
  const mime = String(effectiveMime || '').toLowerCase();
  if (mime.startsWith('image/')) {
    return true;
  }

  const name = String(item.name || '').toLowerCase();
  return /\.(jpe?g|png|gif|webp|bmp|svg|heic|heif|avif)$/i.test(name);
}

function buildOriginalLink(item, effectiveMime, targetRemoteId) {
  if (item.webViewLink) return item.webViewLink;

  const mime = String(effectiveMime || '').toLowerCase();
  if (!targetRemoteId) return null;

  if (mime === 'application/vnd.google-apps.document') {
    return `https://docs.google.com/document/d/${targetRemoteId}/edit`;
  }
  if (mime === 'application/vnd.google-apps.spreadsheet') {
    return `https://docs.google.com/spreadsheets/d/${targetRemoteId}/edit`;
  }
  if (mime === 'application/vnd.google-apps.presentation') {
    return `https://docs.google.com/presentation/d/${targetRemoteId}/edit`;
  }
  if (mime === 'application/vnd.google-apps.form') {
    return `https://docs.google.com/forms/d/${targetRemoteId}/edit`;
  }
  if (mime === 'application/vnd.google-apps.drawing') {
    return `https://docs.google.com/drawings/d/${targetRemoteId}/edit`;
  }

  return `https://drive.google.com/file/d/${targetRemoteId}/view`;
}

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

export async function GET(req, context) {
  try {
    const resolvedParams = await context.params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    await dbConnect();

    const item = await VirtualItem.findById(id);
    if (!item) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const account = await CloudAccount.findById(item.accountId);
    if (!account) {
      return NextResponse.json({ error: 'Linked account not found' }, { status: 404 });
    }

    const targetRemoteId =
      item.isShortcut && item.targetRemoteId ? item.targetRemoteId : item.remoteId;
    const effectiveMime =
      item.isShortcut && item.targetMimeType ? item.targetMimeType : item.mimeType || '';

    // Everything except photos opens in its original link
    if (!isPhotoItem(item, effectiveMime)) {
      const originalUrl = buildOriginalLink(item, effectiveMime, targetRemoteId);
      if (originalUrl) {
        return NextResponse.redirect(originalUrl, { status: 302 });
      }
      return NextResponse.json(
        { error: 'Original link not available for this item' },
        { status: 404 }
      );
    }

    // Stream photos directly
    if (account.provider === 'gdrive') {
      let creds = decryptCreds(account.encryptedCredentials);
      creds = await refreshGoogleAccessTokenIfNeeded(account, creds);

      const driveRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(targetRemoteId)}?alt=media&supportsAllDrives=true`,
        {
          headers: { Authorization: `Bearer ${creds.access_token}` },
          signal: AbortSignal.timeout(DRIVE_TIMEOUT_MS),
        }
      );

      if (!driveRes.ok) {
        const errText = await driveRes.text();
        return NextResponse.json(
          { error: `Failed to fetch photo from Google Drive (${driveRes.status}): ${errText}` },
          { status: driveRes.status }
        );
      }

      const contentType =
        effectiveMime || driveRes.headers.get('content-type') || 'image/jpeg';
      const safeName = (item.name || 'photo').replace(/"/g, '');

      return new NextResponse(driveRes.body, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${safeName}"`,
        },
      });
    }

    return NextResponse.json(
      { error: `Provider "${account.provider}" photo open not yet implemented` },
      { status: 501 }
    );
  } catch (err) {
    console.error('[open] error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to open file' }, { status: 500 });
  }
}