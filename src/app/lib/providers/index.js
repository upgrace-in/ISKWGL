import { google } from 'googleapis';
import { Storage as MegaStorage } from 'megajs';
import crypto from 'crypto';

const ALGO = 'aes-256-cbc';

function getEncryptionKey() {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error('ENCRYPTION_SECRET environment variable is not set');
  }
  return Buffer.from(secret, 'utf8').subarray(0, 32);
}

export function encryptCreds(obj) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(obj)), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptCreds(str) {
  if (!str || typeof str !== 'string' || !str.includes(':')) {
    throw new Error('Missing or invalid encrypted credentials on cloud account');
  }
  const key = getEncryptionKey();
  const [ivHex, dataHex] = str.split(':');
  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(ivHex, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, 'hex')),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString('utf8'));
}

/* ============================================================================
1. GOOGLE DRIVE ADAPTER
   ============================================================================ */
function getGoogleDriveClient(creds) {
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/gdrive`
  );
  oauth2.setCredentials(creds);
  return google.drive({ version: 'v3', auth: oauth2 });
}

async function syncGoogleDrive(creds) {
  const drive = getGoogleDriveClient(creds);

  const [aboutRes, filesRes] = await Promise.all([
    drive.about.get({ fields: 'storageQuota' }),
    drive.files.list({
      pageSize: 500,
      q: 'trashed = false',
      fields: 'files(id, name, mimeType, size, modifiedTime, parents)',
    }),
  ]);

  const quota = aboutRes.data.storageQuota;
  const totalGB = Number(quota.limit || 15 * 1024 ** 3) / 1024 ** 3;
  const usedGB = Number(quota.usage || 0) / 1024 ** 3;

  const items = (filesRes.data.files || []).map((f) => ({
    remoteId: f.id,
    name: f.name,
    type: f.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
    sizeBytes: Number(f.size || 0),
    mimeType: f.mimeType,
    remoteParentId: f.parents?.[0] || null,
    updatedAtStr: (f.modifiedTime || new Date().toISOString()).slice(0, 10),
  }));

  return { usedGB, totalGB, items };
}

/* ============================================================================
3. BOX ADAPTER
   ============================================================================ */
async function syncBox(creds) {
  const headers = { Authorization: `Bearer ${creds.accessToken}` };

  const [meRes, itemsRes] = await Promise.all([
    fetch('https://api.box.com/2.0/users/me?fields=space_amount,space_used', { headers }),
    fetch('https://api.box.com/2.0/folders/0/items?limit=500&fields=id,name,type,size,modified_at', {
      headers,
    }),
  ]);

  const me = await meRes.json();
  const list = await itemsRes.json();

  const totalGB = (me.space_amount || 10 * 1024 ** 3) / 1024 ** 3;
  const usedGB = (me.space_used || 0) / 1024 ** 3;

  const items = (list.entries || []).map((entry) => ({
    remoteId: entry.id,
    name: entry.name,
    type: entry.type === 'folder' ? 'folder' : 'file',
    sizeBytes: entry.size || 0,
    mimeType: '',
    remoteParentId: null,
    updatedAtStr: (entry.modified_at || new Date().toISOString()).slice(0, 10),
  }));

  return { usedGB, totalGB, items };
}

/* ============================================================================
4. PCLOUD ADAPTER
   ============================================================================ */
async function syncPCloud(creds) {
  const host = creds.hostname || 'api.pcloud.com';
  const headers = { Authorization: `Bearer ${creds.accessToken}` };

  const [userRes, listRes] = await Promise.all([
    fetch(`https://${host}/userinfo`, { headers }),
    fetch(`https://${host}/listfolder?folderid=0&recursive=1`, { headers }),
  ]);

  const user = await userRes.json();
  const folderData = await listRes.json();

  const totalGB = (user.quota || 10 * 1024 ** 3) / 1024 ** 3;
  const usedGB = (user.usedquota || 0) / 1024 ** 3;

  const items = [];
  function flatten(contents, parentId = null) {
    if (!contents) return;
    for (const entry of contents) {
      const remoteId = String(entry.isfolder ? entry.folderid : entry.fileid);
      items.push({
        remoteId,
        name: entry.name,
        type: entry.isfolder ? 'folder' : 'file',
        sizeBytes: entry.size || 0,
        mimeType: entry.contenttype || '',
        remoteParentId: parentId,
        updatedAtStr: new Date(entry.modified || Date.now()).toISOString().slice(0, 10),
      });
      if (entry.isfolder && entry.contents) {
        flatten(entry.contents, remoteId);
      }
    }
  }
  flatten(folderData?.metadata?.contents);

  return { usedGB, totalGB, items };
}

/* ============================================================================
   UNIFIED ENTRYPOINT
   ============================================================================ */
export async function fetchProviderState(account) {
  switch (account.provider) {
    case 'gdrive': {
      const creds = decryptCreds(account.encryptedCredentials);
      return syncGoogleDrive(creds);
    }
    case 'mega':
      return syncMega(account);
    case 'box': {
      const creds = decryptCreds(account.encryptedCredentials);
      return syncBox(creds);
    }
    case 'pcloud': {
      const creds = decryptCreds(account.encryptedCredentials);
      return syncPCloud(creds);
    }
    default:
      throw new Error(`Unsupported provider: ${account.provider}`);
  }
}



export async function findMegaFileNode(account, remoteId) {
  const storage = await connectMegaStorage(account);
  const targetId = String(remoteId);
  let foundNode = null;

  function searchNode(node) {
    if (!node || foundNode) return;
    const nodeKey = String(node.nodeId || node.downloadId || '');
    if (!node.directory && nodeKey === targetId) {
      foundNode = node;
      return;
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        searchNode(child);
        if (foundNode) return;
      }
    }
  }

  searchNode(storage.root);

  if (!foundNode && storage.files) {
    for (const val of Object.values(storage.files)) {
      const key = String(val?.nodeId || val?.downloadId || '');
      if (val && !val.directory && key === targetId) {
        foundNode = val;
        break;
      }
    }
  }

  return { storage, fileNode: foundNode };
}

export async function getMegaFileBuffer(account, remoteId) {
  const { storage, fileNode } = await findMegaFileNode(account, remoteId);

  if (!fileNode) {
    if (typeof storage.close === 'function') storage.close();
    throw new Error('File not found in MEGA account');
  }

  const buffer = await fileNode.downloadBuffer();
  if (typeof storage.close === 'function') storage.close();
  return { buffer, name: fileNode.name };
}

export async function getMegaFileWebStream(account, remoteId) {
  const { storage, fileNode } = await findMegaFileNode(account, remoteId);

  if (!fileNode) {
    if (typeof storage.close === 'function') storage.close();
    throw new Error('File not found in MEGA account');
  }

  const nodeStream = fileNode.download();

  const webStream = new ReadableStream({
    start(controller) {
      nodeStream.on('data', (chunk) => {
        controller.enqueue(new Uint8Array(chunk));
      });
      nodeStream.on('end', () => {
        if (typeof storage.close === 'function') storage.close();
        controller.close();
      });
      nodeStream.on('error', (err) => {
        if (typeof storage.close === 'function') storage.close();
        controller.error(err);
      });
    },
    cancel() {
      if (typeof nodeStream.destroy === 'function') nodeStream.destroy();
      if (typeof storage.close === 'function') storage.close();
    },
  });

  return { stream: webStream, name: fileNode.name, size: fileNode.size };
}


/* ============================================================================
   MEGA ADAPTER
   ============================================================================ */

function createMegaClient(options) {
  const client = new MegaStorage(options);

  client.on('error', (err) => {
    console.error('[mega] Client error:', err?.message || err);
  });

  return client;
}

/**
 * Persist the complete MEGAJS session.
 * The session is encrypted before saving to MongoDB.
 */
async function persistMegaSessionIfChanged(account, creds, storage) {
  if (!storage || typeof storage.toJSON !== 'function') {
    console.warn('[mega] Session serialization unavailable');
    return creds;
  }

  const sessionJson = storage.toJSON();

  if (!sessionJson) {
    console.warn('[mega] Empty session returned by MEGAJS');
    return creds;
  }

  const updatedCreds = {
    ...creds,
    sessionJson,
    sid: storage.sid ? String(storage.sid) : creds.sid || null,
  };

  // Do not compare serialized session objects using JSON.stringify:
  // object property ordering is not a reliable change detector.
  if (typeof account.save === 'function') {
    try {
      account.encryptedCredentials = encryptCreds(updatedCreds);
      await account.save();

      console.log('[mega] Session successfully saved to MongoDB');
    } catch (err) {
      console.error(
        '[mega] Failed to persist session:',
        err?.message || err
      );
    }
  }

  return updatedCreds;
}

/**
 * Connect to MEGA.
 *
 * Priority:
 * 1. Restore saved MEGAJS session.
 * 2. If restoration fails, login with email/password.
 * 3. Save the new session.
 */
export async function connectMegaStorage(account) {
  console.log('[mega] Account credentials:', {
    accountId: account?._id?.toString?.() || account?.id,
    credentialsPresent: !!account?.encryptedCredentials,
  });

  const creds = decryptCreds(account.encryptedCredentials);

  let storage = null;

  // --------------------------------------------------
  // STEP 1: Restore existing MEGAJS session
  // --------------------------------------------------

  if (creds.sessionJson) {
    try {
      console.log('[mega] Attempting native MEGAJS session restoration');

      storage = createMegaClientFromSession(creds.sessionJson);

      // Wait for the latest remote directory structure.
      await storage.reload();

      console.log('[mega] Existing session restored successfully');

      // Save any updated session information.
      await persistMegaSessionIfChanged(account, creds, storage);

      return storage;

    } catch (sessionError) {
      console.warn(
        '[mega] Session restoration failed:',
        sessionError?.message || sessionError
      );

      if (storage && typeof storage.close === 'function') {
        storage.close();
      }

      storage = null;
    }
  }

  // --------------------------------------------------
  // STEP 2: Fallback to email/password
  // --------------------------------------------------

  const email = String(creds.email || '').trim();
  const password = String(creds.password || '');

  if (!email || !password) {
    throw new Error(
      'MEGA session is unavailable or expired, and email/password credentials are missing. Please reconnect the MEGA account.'
    );
  }

  console.log('[mega] Attempting email/password authentication');

  storage = createMegaClient({
    email,
    password,
    autoload: true,
  });

  try {
    await storage.ready;

    console.log('[mega] Email/password authentication successful');

    // --------------------------------------------------
    // STEP 3: Save the newly authenticated session
    // --------------------------------------------------

    await persistMegaSessionIfChanged(account, creds, storage);

    return storage;

  } catch (loginError) {
    if (storage && typeof storage.close === 'function') {
      storage.close();
    }

    console.error(
      '[mega] Email/password authentication failed:',
      loginError?.message || loginError
    );

    throw loginError;
  }
}

/**
 * Restore an existing serialized MEGAJS session.
 */

function createMegaClientFromSession(sessionJson) {
  if (!sessionJson) {
    throw new Error('Missing MEGA session JSON');
  }

  const storage = MegaStorage.fromJSON(sessionJson);

  if (!storage) {
    throw new Error('MEGAJS could not initialize the saved session');
  }

  if (typeof storage.on === 'function') {
    storage.on('error', (err) => {
      console.error(
        '[mega] Restored session error:',
        err?.message || err
      );
    });
  }

  return storage;
}


/**
 * Fetch current MEGA account information and files.
 */
async function syncMega(account) {
  const storage = await connectMegaStorage(account);

  try {
    // Ensure the file tree is available.
    if (!storage.root) {
      await storage.reload();
    }

    if (!storage.root) {
      throw new Error('MEGA storage root node was not initialized');
    }

    const info = await storage.getAccountInfo();

    const totalGB =
      Number(info?.spaceTotal || 20 * 1024 ** 3) / 1024 ** 3;

    const usedGB =
      Number(info?.spaceUsed || 0) / 1024 ** 3;

    const items = [];

    function walk(node, parentRemoteId = null) {
      if (!node || !Array.isArray(node.children)) return;

      for (const child of node.children) {
        const remoteId = String(
          child.nodeId || child.downloadId || child.name
        );

        items.push({
          remoteId,
          name: child.name || 'Untitled',

          type: child.directory ? 'folder' : 'file',

          sizeBytes: Number(child.size || 0),

          mimeType: '',
          webViewLink: '',

          isShortcut: false,
          targetRemoteId: null,
          targetMimeType: '',

          remoteParentId: parentRemoteId,

          updatedAtStr: new Date(
            (child.timestamp || Date.now() / 1000) * 1000
          )
            .toISOString()
            .slice(0, 10),
        });

        if (child.directory) {
          walk(child, remoteId);
        }
      }
    }

    walk(storage.root);

    console.log('[mega] Sync completed:', {
      totalItems: items.length,
      usedGB,
      totalGB,
    });

    return {
      usedGB,
      totalGB,
      items,
    };

  }
  catch(err) {
    console.error('[mega] Sync failed:', err?.message || err);
    throw err;
  }
}
