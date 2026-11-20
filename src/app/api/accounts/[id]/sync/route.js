import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

import dbConnect from '@/app/lib/dbConnect';
import CloudAccount from '@/models/CloudAccount';
import VirtualItem from '@/models/VirtualItem';

import {
  decryptCreds,
  encryptCreds,
} from '@/app/lib/providers';

const DRIVE_TIMEOUT_MS = 20000;

// --------------------------------------------------
// 1. Refresh Google Access Token
// --------------------------------------------------

async function refreshGoogleAccessTokenIfNeeded(account, creds) {
  if (!creds.refresh_token) return creds;

  const res = await fetch(
    'https://oauth2.googleapis.com/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        refresh_token: creds.refresh_token,
        grant_type: 'refresh_token',
      }),
      signal: AbortSignal.timeout(DRIVE_TIMEOUT_MS),
    }
  );

  const data = await res.json();

  if (!res.ok || !data.access_token) {
    throw new Error(
      `Google token refresh failed (${res.status}): ${JSON.stringify(data)}`
    );
  }

  const updated = {
    ...creds,
    access_token: data.access_token,
  };

  account.encryptedCredentials = encryptCreds(updated);

  return updated;
}

// --------------------------------------------------
// 2. Fetch Google Drive Storage Quota
// --------------------------------------------------

async function fetchChildrenOfSharedFolders(headers, initialFiles) {
  const seenIds = new Set(initialFiles.map((f) => f.id));
  const collected = [...initialFiles];

  const parentIdsWithChildren = new Set();
  for (const f of initialFiles) {
    for (const pid of f.parents || []) {
      parentIdsWithChildren.add(pid);
    }
  }

  // Candidate folders: folders from initialFiles with no children yet, plus sharedWithMe folders
  const folderQueue = initialFiles
    .filter((f) => {
      const isShortcut = f.mimeType === 'application/vnd.google-apps.shortcut';
      const effectiveMime = isShortcut ? f.shortcutDetails?.targetMimeType : f.mimeType;
      const effectiveId = isShortcut ? f.shortcutDetails?.targetId || f.id : f.id;
      return (
        effectiveMime === 'application/vnd.google-apps.folder' &&
        !parentIdsWithChildren.has(effectiveId)
      );
    })
    .map((f) =>
      f.mimeType === 'application/vnd.google-apps.shortcut'
        ? f.shortcutDetails?.targetId || f.id
        : f.id
    );

  // Also explicitly fetch sharedWithMe folders in case any were missed
  const sharedUrl = new URL('https://www.googleapis.com/drive/v3/files');
  sharedUrl.searchParams.set('pageSize', '1000');
  sharedUrl.searchParams.set(
    'q',
    "sharedWithMe = true and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
  );
  sharedUrl.searchParams.set('supportsAllDrives', 'true');
  sharedUrl.searchParams.set('includeItemsFromAllDrives', 'true');
  sharedUrl.searchParams.set('fields', 'files(id,name,mimeType,size,modifiedTime,parents,shortcutDetails(targetId,targetMimeType),webViewLink)');

  const sharedRes = await fetch(sharedUrl.toString(), {
    headers,
    signal: AbortSignal.timeout(DRIVE_TIMEOUT_MS),
  });
  if (sharedRes.ok) {
    const sharedData = await sharedRes.json();
    for (const sf of sharedData.files || []) {
      if (!seenIds.has(sf.id)) {
        seenIds.add(sf.id);
        collected.push(sf);
      }
      const isShortcut = sf.mimeType === 'application/vnd.google-apps.shortcut';
      const fid = isShortcut ? sf.shortcutDetails?.targetId || sf.id : sf.id;
      folderQueue.push(fid);
    }
  }

  const visitedFolders = new Set();

  while (folderQueue.length > 0) {
    const parentId = folderQueue.shift();
    if (!parentId || visitedFolders.has(parentId)) continue;
    visitedFolders.add(parentId);

    let pageToken = null;
    do {
      const url = new URL('https://www.googleapis.com/drive/v3/files');
      url.searchParams.set('pageSize', '1000');
      url.searchParams.set('q', `'${parentId}' in parents and trashed = false`);
      url.searchParams.set('supportsAllDrives', 'true');
      url.searchParams.set('includeItemsFromAllDrives', 'true');
      url.searchParams.set(
        'fields',
        'nextPageToken,files(id,name,mimeType,size,modifiedTime,parents,shortcutDetails(targetId,targetMimeType),webViewLink)'
      );
      if (pageToken) url.searchParams.set('pageToken', pageToken);

      const res = await fetch(url.toString(), {
        headers,
        signal: AbortSignal.timeout(DRIVE_TIMEOUT_MS),
      });
      if (!res.ok) break;

      const data = await res.json();
      for (const child of data.files || []) {
        if (!seenIds.has(child.id)) {
          seenIds.add(child.id);
          collected.push(child);
        }

        const isChildShortcut = child.mimeType === 'application/vnd.google-apps.shortcut';
        const childMime = isChildShortcut
          ? child.shortcutDetails?.targetMimeType
          : child.mimeType;

        if (childMime === 'application/vnd.google-apps.folder') {
          const nextFolderId = isChildShortcut
            ? child.shortcutDetails?.targetId || child.id
            : child.id;
          if (!visitedFolders.has(nextFolderId)) {
            folderQueue.push(nextFolderId);
          }
        }
      }

      pageToken = data.nextPageToken || null;
    } while (pageToken);
  }

  return collected;
}

async function fetchDriveQuota(headers) {
  const res = await fetch(
    'https://www.googleapis.com/drive/v3/about?fields=storageQuota',
    {
      headers,
      signal: AbortSignal.timeout(DRIVE_TIMEOUT_MS),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      `Drive quota failed (${res.status}): ${JSON.stringify(data)}`
    );
  }

  return data.storageQuota || {};
}

// --------------------------------------------------
// 3. Fetch ALL Google Drive Files and Folders
// --------------------------------------------------

async function fetchAllDriveFiles(headers) {
  const allFiles = [];
  let pageToken = null;
  let page = 0;

  do {
    page++;

    const url = new URL(
      'https://www.googleapis.com/drive/v3/files'
    );

    url.searchParams.set('pageSize', '1000');
    url.searchParams.set('q', 'trashed = false');

    url.searchParams.set('corpora', 'allDrives');
    url.searchParams.set('supportsAllDrives', 'true');
    url.searchParams.set('includeItemsFromAllDrives', 'true');

    url.searchParams.set(
      'fields',
      'nextPageToken,incompleteSearch,files(id,name,mimeType,size,modifiedTime,parents,shortcutDetails(targetId,targetMimeType),webViewLink)'
    );

    if (pageToken) {
      url.searchParams.set('pageToken', pageToken);
    }

    const res = await fetch(url.toString(), {
      headers,
      signal: AbortSignal.timeout(DRIVE_TIMEOUT_MS),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        `Drive files.list failed on page ${page} (${res.status}): ${JSON.stringify(data)}`
      );
    }

    if (data.incompleteSearch) {
      throw new Error(
        'Google Drive returned incompleteSearch=true. Sync aborted to avoid saving incomplete data.'
      );
    }

    const files = data.files || [];

    allFiles.push(...files);

    console.log('[sync] Page fetched:', {
      page,
      batchCount: files.length,
      totalCount: allFiles.length,
    });

    pageToken = data.nextPageToken || null;

  } while (pageToken);

  return allFiles;
}

// --------------------------------------------------
// 4. Helper for Web-Based App URLs
// --------------------------------------------------

function resolveWebViewLink(file, effectiveMime, effectiveTargetId) {
  if (file.webViewLink) return file.webViewLink;

  const targetId = effectiveTargetId || file.id;
  if (!targetId) return '';

  switch (effectiveMime) {
    case 'application/vnd.google-apps.document':
      return `https://docs.google.com/document/d/${targetId}/edit`;
    case 'application/vnd.google-apps.spreadsheet':
      return `https://docs.google.com/spreadsheets/d/${targetId}/edit`;
    case 'application/vnd.google-apps.presentation':
      return `https://docs.google.com/presentation/d/${targetId}/edit`;
    case 'application/vnd.google-apps.form':
      return `https://docs.google.com/forms/d/${targetId}/edit`;
    case 'application/vnd.google-apps.drawing':
      return `https://docs.google.com/drawings/d/${targetId}/edit`;
    default:
      return '';
  }
}

// --------------------------------------------------
// 5. Normalize Google Drive Data
// --------------------------------------------------

function normalizeDriveFiles(rawFiles, accountId, syncBatchId) {
  return rawFiles.map((file) => {
    const isShortcut =
      file.mimeType === 'application/vnd.google-apps.shortcut';

    // Always preserve the original Google Drive item ID.
    const remoteId = file.id;

    const mimeType = file.mimeType || '';

    const targetRemoteId = isShortcut
      ? file.shortcutDetails?.targetId || null
      : null;

    const targetMimeType = isShortcut
      ? file.shortcutDetails?.targetMimeType || ''
      : '';

    const effectiveMime = isShortcut
      ? targetMimeType || mimeType
      : mimeType;

    const isFolder =
      effectiveMime === 'application/vnd.google-apps.folder';

    const webViewLink = resolveWebViewLink(
      file,
      effectiveMime,
      targetRemoteId
    );

    return {
      remoteId,

      // Google Drive parent ID, not MongoDB ObjectId.
      remoteParentId:
        file.parents?.[0] || null,

      remoteParents: file.parents || [],

      name: file.name || 'Untitled',

      type: isFolder ? 'folder' : 'file',

      sizeBytes: Number(file.size || 0),

      mimeType,

      webViewLink,

      isShortcut,

      targetRemoteId,

      targetMimeType,

      // Will be populated after folder insertion.
      parentId: null,

      accountId,

      syncBatchId,

      updatedAtStr:
        file.modifiedTime
          ? file.modifiedTime.slice(0, 10)
          : '',
    };
  });
}

// --------------------------------------------------
// 6. Save Folders and Build Hierarchy
// --------------------------------------------------

async function saveDriveItems(normalized, accountId) {
  const folders = normalized.filter(
    (item) => item.type === 'folder'
  );

  const files = normalized.filter(
    (item) => item.type === 'file'
  );

  // Insert folders first, initially without MongoDB parents.
  const insertedFolders = folders.length
    ? await VirtualItem.insertMany(folders)
    : [];

  // Google Drive Folder ID -> MongoDB ObjectId
  const folderIdMap = new Map();

  for (const folder of insertedFolders) {
    folderIdMap.set(folder.remoteId, folder._id);
    if (folder.isShortcut && folder.targetRemoteId) {
      folderIdMap.set(folder.targetRemoteId, folder._id);
    }
  }

  // ----------------------------------------------
  // Establish folder -> folder relationships
  // ----------------------------------------------

  const folderParentOperations = [];

  let matchedFolders = 0;
  let unmatchedFolders = 0;

  for (const folder of insertedFolders) {
    const remoteParentId = folder.remoteParentId;

    const mongoParentId =
      (folder.remoteParents || [])
        .map((pid) => folderIdMap.get(pid))
        .find(Boolean) ||
      (remoteParentId ? folderIdMap.get(remoteParentId) : null) ||
      null;

    if (mongoParentId) {
      matchedFolders++;
    } else if (remoteParentId) {
      unmatchedFolders++;
    }

    folderParentOperations.push({
      updateOne: {
        filter: {
          _id: folder._id,
          accountId,
        },
        update: {
          $set: {
            parentId: mongoParentId,
          },
        },
      },
    });
  }

  if (folderParentOperations.length) {
    await VirtualItem.bulkWrite(
      folderParentOperations,
      { ordered: false }
    );
  }

  // ----------------------------------------------
  // Establish file -> folder relationships
  // ----------------------------------------------

  let matchedFiles = 0;
  let unmatchedFiles = 0;

  const filesToInsert = files.map((file) => {
    const mongoParentId =
      (file.remoteParents || [])
        .map((pid) => folderIdMap.get(pid))
        .find(Boolean) ||
      (file.remoteParentId ? folderIdMap.get(file.remoteParentId) : null) ||
      null;

    if (mongoParentId) {
      matchedFiles++;
    } else if (file.remoteParentId) {
      unmatchedFiles++;
    }

    return {
      ...file,
      parentId: mongoParentId,
    };
  });

  // Insert all files with their correct parent references.
  if (filesToInsert.length) {
    await VirtualItem.insertMany(filesToInsert);
  }

  return {
    total: normalized.length,

    folders: insertedFolders.length,
    files: filesToInsert.length,

    matchedFolders,
    unmatchedFolders,

    matchedFiles,
    unmatchedFiles,
  };
}

// --------------------------------------------------
// 7. Main POST Handler
// --------------------------------------------------

export async function POST(req, context) {
  const start = Date.now();

  let syncBatchId;

  try {
    const params = await context.params;
    const accountId = params?.id;

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const account = await CloudAccount.findById(accountId);

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    if (account.provider !== 'gdrive') {
      return NextResponse.json(
        { error: 'Unsupported cloud provider' },
        { status: 400 }
      );
    }

    // ----------------------------------------------
    // Authentication
    // ----------------------------------------------

    let creds = decryptCreds(
      account.encryptedCredentials
    );

    creds = await refreshGoogleAccessTokenIfNeeded(
      account,
      creds
    );

    const headers = {
      Authorization: `Bearer ${creds.access_token}`,
    };

    // ----------------------------------------------
    // Fetch Drive Data
    // ----------------------------------------------

    const [quota, initialRawFiles] = await Promise.all([
      fetchDriveQuota(headers),
      fetchAllDriveFiles(headers),
    ]);

    const rawFiles = await fetchChildrenOfSharedFolders(headers, initialRawFiles);

    console.log('[sync] Drive data fetched:', {
      totalFiles: rawFiles.length,
      elapsedMs: Date.now() - start,
    });

    // ----------------------------------------------
    // Prepare New Sync Batch
    // ----------------------------------------------

    syncBatchId = randomUUID();

    const normalized = normalizeDriveFiles(
      rawFiles,
      account._id,
      syncBatchId
    );

    // ----------------------------------------------
    // Save New Hierarchy
    // ----------------------------------------------

    const summary = await saveDriveItems(
      normalized,
      account._id
    );

    // ----------------------------------------------
    // Remove Previous Sync ONLY AFTER success
    // ----------------------------------------------

    await VirtualItem.deleteMany({
      accountId: account._id,
      syncBatchId: { $ne: syncBatchId },
    });

    // ----------------------------------------------
    // Update Account Information
    // ----------------------------------------------

    const totalBytes = Number(
      quota.limit || 15 * 1024 ** 3
    );

    const usedBytes = Number(
      quota.usage || 0
    );

    account.totalGB = Number(
      (totalBytes / 1024 ** 3).toFixed(3)
    );

    account.usedGB = Number(
      (usedBytes / 1024 ** 3).toFixed(3)
    );

    account.lastSyncedAt = new Date();

    await account.save();

    console.log('[sync] Hierarchy summary:', summary);

    console.log('[sync] Complete:', {
      elapsedMs: Date.now() - start,
    });

    return NextResponse.json({
      ok: true,

      message: 'Google Drive synchronized successfully',

      syncedAt: account.lastSyncedAt,

      summary,
    });

  } catch (err) {
    console.error(
      '[sync] Error after',
      Date.now() - start,
      'ms:',
      err
    );

    return NextResponse.json(
      {
        error: err?.message || 'Sync failed',
        name: err?.name,
      },
      { status: 500 }
    );
  }
}