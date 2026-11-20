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
   2. MEGA ADAPTER (Uses Email + Password via megajs)
   ============================================================================ */
async function syncMega(creds) {
  const storage = await new MegaStorage({
    email: creds.email,
    password: creds.password,
  }).ready;

  const info = await storage.getAccountInfo();
  const totalGB = (info.spaceTotal || 20 * 1024 ** 3) / 1024 ** 3;
  const usedGB = (info.spaceUsed || 0) / 1024 ** 3;

  const items = [];
  function walk(node, parentRemoteId = null) {
    if (!node.children) return;
    for (const child of node.children) {
      items.push({
        remoteId: child.nodeId,
        name: child.name,
        type: child.directory ? 'folder' : 'file',
        sizeBytes: child.size || 0,
        mimeType: '',
        remoteParentId: parentRemoteId,
        updatedAtStr: new Date((child.timestamp || Date.now() / 1000) * 1000)
          .toISOString()
          .slice(0, 10),
      });
      if (child.directory) walk(child, child.nodeId);
    }
  }
  walk(storage.root);
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
  const creds = decryptCreds(account.encryptedCredentials);
  switch (account.provider) {
    case 'gdrive':
      return syncGoogleDrive(creds);
    case 'mega':
      return syncMega(creds);
    case 'box':
      return syncBox(creds);
    case 'pcloud':
      return syncPCloud(creds);
    default:
      throw new Error(`Unsupported provider: ${account.provider}`);
  }
}