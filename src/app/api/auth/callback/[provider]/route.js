import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import CloudAccount from '@/models/CloudAccount';
import VirtualItem from '@/models/VirtualItem';
import { encryptCreds } from '@/app/lib/providers';
import { randomUUID } from 'crypto';


async function fetchAllDriveFiles(accessToken) {
  const allFiles = [];
  let pageToken = null;

  while (true) {
    const url = new URL(
      'https://www.googleapis.com/drive/v3/files'
    );

    url.searchParams.set('pageSize', '1000');
    url.searchParams.set('q', 'trashed = false');

    url.searchParams.set(
      'fields',
      'nextPageToken,incompleteSearch,files(id,name,mimeType,size,modifiedTime,parents)'
    );

    url.searchParams.set('includeItemsFromAllDrives', 'true');
    url.searchParams.set('supportsAllDrives', 'true');

    if (pageToken) {
      url.searchParams.set('pageToken', pageToken);
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Drive files.list failed: ${response.status} - ${JSON.stringify(data)}`
      );
    }

    allFiles.push(...(data.files || []));

    pageToken = data.nextPageToken;

    if (!pageToken) {
      break;
    }
  }

  return allFiles;
}


export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/callback/gdrive`;
    const initialSyncBatchId = randomUUID();

    if (!code) {
      return NextResponse.redirect(`${baseUrl}/?error=missing_code`);
    }

    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok || !tokens.access_token) {
      console.error('Token exchange failed:', tokens);
      return NextResponse.json({ error: 'Token exchange failed', details: tokens }, { status: 500 });
    }

    const authHeaders = { Authorization: `Bearer ${tokens.access_token}` };

    // 2. Fetch user email, quota, and files in parallel
    const [userRes, aboutRes] = await Promise.all([
      fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: authHeaders,
      }),

      fetch(
        'https://www.googleapis.com/drive/v3/about?fields=storageQuota',
        {
          headers: authHeaders,
        }
      ),
    ]);

    const userInfo = await userRes.json();
    const aboutData = await aboutRes.json();

    const rawFiles = await fetchAllDriveFiles(tokens.access_token);

    console.log('Fetched Drive files count:', rawFiles.length);

    const quota = aboutData.storageQuota || {};
    const totalGB = parseFloat((Number(quota.limit || 15 * 1024 ** 3) / 1024 ** 3).toFixed(3));
    const usedGB = parseFloat((Number(quota.usage || 0) / 1024 ** 3).toFixed(3));

    await dbConnect();

    const email = userInfo.email || 'gdrive_user';
    const count = (await CloudAccount.countDocuments({ provider: 'gdrive' })) + 1;
    const alias = `gdrive_${String(count).padStart(2, '0')}`;

    const account = await CloudAccount.create({
      provider: 'gdrive',
      alias,
      email,
      encryptedCredentials: encryptCreds(tokens),
      usedGB,
      totalGB,
      lastSyncedAt: new Date(),
    });

    // const rawFiles = filesData.files || [];
    if (rawFiles.length > 0) {
      
      const FOLDER_MIME =
        'application/vnd.google-apps.folder';

      // 1. Normalize all Google Drive files
      const normalizedFiles = rawFiles.map((file) => ({
        remoteId: file.id,

        remoteParentId: file.parents?.[0] || null,

        name: file.name || 'Untitled',

        type: file.mimeType === FOLDER_MIME
          ? 'folder'
          : 'file',

        sizeBytes: Number(file.size || 0),

        mimeType: file.mimeType || '',

        updatedAtStr: (
          file.modifiedTime || new Date().toISOString()
        ).slice(0, 10),

        accountId: account._id,

        syncBatchId: initialSyncBatchId,
      }));

      // 2. Insert folders first
      const folders = normalizedFiles.filter(
        (file) => file.type === 'folder'
      );

      const insertedFolders = folders.length
        ? await VirtualItem.insertMany(
            folders.map((folder) => ({
              ...folder,
              parentId: null,
            }))
          )
        : [];

      // 3. Map Google Drive folder ID -> MongoDB folder _id
      const folderIdMap = new Map();

      for (const folder of insertedFolders) {
        folderIdMap.set(
          String(folder.remoteId),
          folder._id
        );
      }

      // 4. Resolve folder-to-folder relationships
      for (const folder of insertedFolders) {
        const normalizedFolder = folders.find(
          (item) => item.remoteId === folder.remoteId
        );

        const googleParentId =
          normalizedFolder?.remoteParentId;

        if (googleParentId) {
          const mongoParentId = folderIdMap.get(
            String(googleParentId)
          );

          if (mongoParentId) {
            folder.parentId = mongoParentId;
          }
        }
      }

      // 5. Save folder parent relationships
      if (insertedFolders.length) {
        await VirtualItem.bulkWrite(
          insertedFolders.map((folder) => ({
            updateOne: {
              filter: {
                _id: folder._id,
              },
              update: {
                $set: {
                  parentId: folder.parentId,
                },
              },
            },
          }))
        );
      }

      // 6. Insert files and resolve their parent folders
      const files = normalizedFiles.filter(
        (file) => file.type === 'file'
      );

      const fileDocuments = files.map((file) => ({
        ...file,

        parentId: file.remoteParentId
          ? folderIdMap.get(String(file.remoteParentId)) || null
          : null,
      }));

      if (fileDocuments.length) {
        await VirtualItem.insertMany(fileDocuments);
      }

      console.log('Folders inserted:', insertedFolders.length);
      console.log('Files inserted:', fileDocuments.length);

    }

    return NextResponse.redirect(`${baseUrl}/`);
  } catch (err) {
    console.error('GDrive callback error:', err);
    return NextResponse.json({ error: err.message || 'Callback failed' }, { status: 500 });
  }
}