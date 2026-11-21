import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import mongoose from 'mongoose';

import dbConnect from '@/app/lib/dbConnect';
import CloudAccount from '@/models/CloudAccount';
import VirtualItem from '@/models/VirtualItem';

import {
  decryptCreds,
  encryptCreds,
  fetchProviderState,
} from '@/app/lib/providers';

const DRIVE_TIMEOUT_MS = 20000;
const SHARED_CRAWL_CONCURRENCY = 8;
const SHARED_CRAWL_BUDGET_MS = 18000;

export const maxDuration = 60;

// --------------------------------------------------
// 1. Refresh Google Access Token
// --------------------------------------------------

async function refreshGoogleAccessTokenIfNeeded(account, creds) {
  if (!creds.refresh_token) return creds;

  const res = await fetch('https://oauth2.googleapis.com/token', {
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
  });

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

    const url = new URL('https://www.googleapis.com/drive/v3/files');
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
// 4. Crawl Nested Items Inside Shared Folders (Batched)
// --------------------------------------------------

async function fetchChildrenOfSharedFolders(headers, initialFiles) {
  const crawlStart = Date.now();
  const seenIds = new Set(initialFiles.map((f) => f.id));
  const collected = [...initialFiles];

  const folderQueue = [];

  for (const f of initialFiles) {
    if (
      f.mimeType === 'application/vnd.google-apps.shortcut' &&
      f.shortcutDetails?.targetMimeType === 'application/vnd.google-apps.folder' &&
      f.shortcutDetails?.targetId
    ) {
      folderQueue.push(f.shortcutDetails.targetId);
    }
  }

  let sharedPageToken = null;
  do {
    const sharedUrl = new URL('https://www.googleapis.com/drive/v3/files');
    sharedUrl.searchParams.set('pageSize', '1000');
    sharedUrl.searchParams.set(
      'q',
      "sharedWithMe = true and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    );
    sharedUrl.searchParams.set('supportsAllDrives', 'true');
    sharedUrl.searchParams.set('includeItemsFromAllDrives', 'true');
    sharedUrl.searchParams.set(
      'fields',
      'nextPageToken,files(id,name,mimeType,size,modifiedTime,parents,shortcutDetails(targetId,targetMimeType),webViewLink)'
    );
    if (sharedPageToken) {
      sharedUrl.searchParams.set('pageToken', sharedPageToken);
    }

    const sharedRes = await fetch(sharedUrl.toString(), {
      headers,
      signal: AbortSignal.timeout(DRIVE_TIMEOUT_MS),
    });

    if (!sharedRes.ok) break;

    const sharedData = await sharedRes.json();
    for (const sf of sharedData.files || []) {
      if (!seenIds.has(sf.id)) {
        seenIds.add(sf.id);
        collected.push(sf);
      }
      const isShortcut = sf.mimeType === 'application/vnd.google-apps.shortcut';
      const fid = isShortcut ? sf.shortcutDetails?.targetId || sf.id : sf.id;
      if (fid) folderQueue.push(fid);
    }

    sharedPageToken = sharedData.nextPageToken || null;
  } while (sharedPageToken);

  const visitedFolders = new Set();

  while (folderQueue.length > 0) {
    if (Date.now() - crawlStart > SHARED_CRAWL_BUDGET_MS) {
      console.warn('[sync] Shared folder crawl reached time budget; stopping early.');
      break;
    }

    const batch = [];
    while (batch.length < SHARED_CRAWL_CONCURRENCY && folderQueue.length > 0) {
      const nextId = folderQueue.shift();
      if (nextId && !visitedFolders.has(nextId)) {
        visitedFolders.add(nextId);
        batch.push(nextId);
      }
    }

    if (batch.length === 0) continue;

    await Promise.all(
      batch.map(async (parentId) => {
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

            const isChildShortcut =
              child.mimeType === 'application/vnd.google-apps.shortcut';
            const childMime = isChildShortcut
              ? child.shortcutDetails?.targetMimeType
              : child.mimeType;

            if (childMime === 'application/vnd.google-apps.folder') {
              const nextFolderId = isChildShortcut
                ? child.shortcutDetails?.targetId || child.id
                : child.id;
              if (nextFolderId && !visitedFolders.has(nextFolderId)) {
                folderQueue.push(nextFolderId);
              }
            }
          }

          pageToken = data.nextPageToken || null;
        } while (pageToken);
      })
    );
  }

  return collected;
}

// --------------------------------------------------
// 5. Helper for Web-Based App URLs
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
// 6. Normalize Drive & Provider Items
// --------------------------------------------------

function normalizeDriveFiles(rawFiles, accountId, syncBatchId) {
  return rawFiles.map((file) => {
    const isShortcut =
      file.mimeType === 'application/vnd.google-apps.shortcut';

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
      _id: new mongoose.Types.ObjectId(),
      remoteId,
      remoteParentId: file.parents?.[0] || null,
      remoteParents: file.parents || [],
      name: file.name || 'Untitled',
      type: isFolder ? 'folder' : 'file',
      sizeBytes: Number(file.size || 0),
      mimeType,
      webViewLink,
      isShortcut,
      targetRemoteId,
      targetMimeType,
      parentId: null,
      accountId,
      syncBatchId,
      updatedAtStr: file.modifiedTime ? file.modifiedTime.slice(0, 10) : '',
    };
  });
}

function normalizeProviderItems(rawItems, accountId, syncBatchId) {
  return (rawItems || []).map((item) => ({
    _id: new mongoose.Types.ObjectId(),
    remoteId: String(item.remoteId || ''),
    remoteParentId: item.remoteParentId ? String(item.remoteParentId) : null,
    remoteParents: item.remoteParentId ? [String(item.remoteParentId)] : [],
    name: item.name || 'Untitled',
    type: item.type === 'folder' ? 'folder' : 'file',
    sizeBytes: Number(item.sizeBytes || 0),
    mimeType: item.mimeType || '',
    webViewLink: item.webViewLink || '',
    isShortcut: Boolean(item.isShortcut),
    targetRemoteId: item.targetRemoteId || null,
    targetMimeType: item.targetMimeType || '',
    parentId: null,
    accountId,
    syncBatchId,
    updatedAtStr: item.updatedAtStr || new Date().toISOString().slice(0, 10),
  }));
}

// --------------------------------------------------
// 7. Save Folders and Build Hierarchy (Single-Pass Insert)
// --------------------------------------------------

async function saveHierarchyItems(normalized) {
  const folders = [];
  const files = [];

  for (const item of normalized) {
    if (item.type === 'folder') {
      folders.push(item);
    } else {
      files.push(item);
    }
  }

  const folderIdMap = new Map();
  for (const folder of folders) {
    if (folder.remoteId) {
      folderIdMap.set(String(folder.remoteId), folder._id);
    }
    if (folder.isShortcut && folder.targetRemoteId) {
      folderIdMap.set(String(folder.targetRemoteId), folder._id);
    }
  }

  let matchedFolders = 0;
  let unmatchedFolders = 0;

  const foldersToInsert = folders.map((folder) => {
    const mongoParentId =
      (folder.remoteParents || [])
        .map((pid) => folderIdMap.get(String(pid)))
        .find(Boolean) ||
      (folder.remoteParentId ? folderIdMap.get(String(folder.remoteParentId)) : null) ||
      null;

    if (mongoParentId) {
      matchedFolders++;
    } else if (folder.remoteParentId) {
      unmatchedFolders++;
    }

    const { remoteParents, ...doc } = folder;
    return { ...doc, parentId: mongoParentId };
  });

  let matchedFiles = 0;
  let unmatchedFiles = 0;

  const filesToInsert = files.map((file) => {
    const mongoParentId =
      (file.remoteParents || [])
        .map((pid) => folderIdMap.get(String(pid)))
        .find(Boolean) ||
      (file.remoteParentId ? folderIdMap.get(String(file.remoteParentId)) : null) ||
      null;

    if (mongoParentId) {
      matchedFiles++;
    } else if (file.remoteParentId) {
      unmatchedFiles++;
    }

    const { remoteParents, ...doc } = file;
    return { ...doc, parentId: mongoParentId };
  });

  const allDocs = [...foldersToInsert, ...filesToInsert];
  if (allDocs.length) {
    await VirtualItem.insertMany(allDocs, { ordered: false });
  }

  return {
    total: allDocs.length,
    folders: foldersToInsert.length,
    files: filesToInsert.length,
    matchedFolders,
    unmatchedFolders,
    matchedFiles,
    unmatchedFiles,
  };
}

// --------------------------------------------------
// 8. Main POST Handler
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

    const account = await CloudAccount.findById(accountId).select('+encryptedCredentials');;

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    syncBatchId = randomUUID();
    let normalized = [];
    let totalBytes = 0;
    let usedBytes = 0;

    if (account.provider === 'gdrive') {
      let creds = decryptCreds(account.encryptedCredentials);
      creds = await refreshGoogleAccessTokenIfNeeded(account, creds);

      const headers = {
        Authorization: `Bearer ${creds.access_token}`,
      };

      const [quota, initialRawFiles] = await Promise.all([
        fetchDriveQuota(headers),
        fetchAllDriveFiles(headers),
      ]);

      const rawFiles = await fetchChildrenOfSharedFolders(headers, initialRawFiles);

      console.log('[sync] Drive data fetched:', {
        totalFiles: rawFiles.length,
        elapsedMs: Date.now() - start,
      });

      totalBytes = Number(quota.limit || 15 * 1024 ** 3);
      usedBytes = Number(quota.usage || 0);
      normalized = normalizeDriveFiles(rawFiles, account._id, syncBatchId);
    } else if (account.provider === 'mega') {
      const state = await fetchProviderState(account);
      totalBytes = Number(state.totalGB || 20) * 1024 ** 3;
      usedBytes = Number(state.usedGB || 0) * 1024 ** 3;
      normalized = normalizeProviderItems(state.items || [], account._id, syncBatchId);
    } else {
      return NextResponse.json(
        { error: `Unsupported cloud provider: ${account.provider}` },
        { status: 400 }
      );
    }

    const summary = await saveHierarchyItems(normalized);

    account.totalGB = Number((totalBytes / 1024 ** 3).toFixed(3));
    account.usedGB = Number((usedBytes / 1024 ** 3).toFixed(3));
    account.lastSyncedAt = new Date();

    await Promise.all([
      VirtualItem.deleteMany({
        accountId: account._id,
        syncBatchId: { $ne: syncBatchId },
      }),
      account.save(),
    ]);

    console.log('[sync] Hierarchy summary:', summary);
    console.log('[sync] Complete:', {
      provider: account.provider,
      elapsedMs: Date.now() - start,
    });

    return NextResponse.json({
      ok: true,
      message: `${account.provider.toUpperCase()} synchronized successfully`,
      syncedAt: account.lastSyncedAt,
      summary,
    });
  } catch (err) {
    console.error('[sync] Error after', Date.now() - start, 'ms:', err);

    return NextResponse.json(
      {
        error: err?.message || 'Sync failed',
        name: err?.name,
      },
      { status: 500 }
    );
  }
}