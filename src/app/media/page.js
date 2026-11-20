"use client";
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import './media.css';
import { selectDestinationAccount } from '@/app/lib/storageAllocation';

/**
 * ============================================================================
 * PLUGGABLE STORAGE ROUTING ENGINE
 * ============================================================================
 * Replace or extend this function later when you define your custom rules
 * (e.g., routing by file extension, file size thresholds, folder regex, etc.).
 *
 * @param {Object} fileMeta - { name, sizeBytes, mimeType, folderPath }
 * @param {Array} accounts  - List of linked cloud account objects
 * @returns {Object}        - Selected target cloud account
 */
// export function selectDestinationAccount(fileMeta, accounts) {
//   if (!accounts || accounts.length === 0) return null;

//   // Default Policy: Most Free Space (MFS)
//   return [...accounts].sort((a, b) => {
//     const freeA = a.totalGB - a.usedGB;
//     const freeB = b.totalGB - b.usedGB;
//     return freeB - freeA;
//   })[0];
// }

// Helper to format bytes cleanly
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

const INITIAL_ACCOUNTS = [
  { id: 'acc-1', provider: 'mega', alias: 'mega_01', email: 'user+mega01@gmail.com', usedGB: 6.4, totalGB: 20 },
  { id: 'acc-2', provider: 'gdrive', alias: 'gdrive_01', email: 'user.main@gmail.com', usedGB: 9.2, totalGB: 15 },
  { id: 'acc-3', provider: 'box', alias: 'box_01', email: 'user+box01@gmail.com', usedGB: 2.1, totalGB: 10 },
  { id: 'acc-4', provider: 'pcloud', alias: 'pcloud_01', email: 'user+pcloud01@gmail.com', usedGB: 1.5, totalGB: 10 },
];

const INITIAL_ITEMS = [
  { id: 'f-1', name: 'Work & Projects', type: 'folder', parentId: null, accountId: 'acc-2', updatedAt: '2026-11-10' },
  { id: 'f-2', name: 'Media Archives', type: 'folder', parentId: null, accountId: 'acc-1', updatedAt: '2026-11-12' },
  { id: 'f-3', name: 'Tax & Legal Docs', type: 'folder', parentId: null, accountId: 'acc-3', updatedAt: '2026-10-28' },
  { id: 'file-1', name: 'Architecture_Blueprint_v2.pdf', type: 'file', sizeBytes: 4820000, parentId: 'f-1', accountId: 'acc-2', updatedAt: '2026-11-14' },
  { id: 'file-2', name: 'API_Gateway_Specs.docx', type: 'file', sizeBytes: 1240000, parentId: 'f-1', accountId: 'acc-4', updatedAt: '2026-11-15' },
  { id: 'file-3', name: '4K_Drone_Footage_Raw.mp4', type: 'file', sizeBytes: 1450000000, parentId: 'f-2', accountId: 'acc-1', updatedAt: '2026-11-11' },
  { id: 'file-4', name: 'System_Backup_Nov2026.tar.gz', type: 'file', sizeBytes: 840000000, parentId: null, accountId: 'acc-1', updatedAt: '2026-11-18' },
  { id: 'file-5', name: 'Cloud_Quota_Tracker.xlsx', type: 'file', sizeBytes: 640000, parentId: null, accountId: 'acc-3', updatedAt: '2026-11-17' },
];



function normalizeAccount(acc) {
  return {
    ...acc,
    id: String(acc._id || acc.id),
    usedGB: Number(acc.usedGB || 0),
    totalGB: Number(acc.totalGB || 15),
  };
}

const WEB_APP_MIME_TYPES = new Set([
  'application/vnd.google-apps.document',
  'application/vnd.google-apps.spreadsheet',
  'application/vnd.google-apps.presentation',
  'application/vnd.google-apps.form',
  'application/vnd.google-apps.drawing',
  'application/vnd.google-apps.site',
  'application/vnd.google-apps.map',
]);

function isWebAppFile(item) {
  const mime = String(item.mimeType || '').toLowerCase();
  if (WEB_APP_MIME_TYPES.has(mime) || mime.startsWith('application/vnd.google-apps.')) {
    return Boolean(item.webViewLink || item.remoteId);
  }
  return false;
}

function getWebAppUrl(item) {
  if (item.webViewLink) return item.webViewLink;
  if (!item.remoteId) return `/api/files/${item.id}/open`;

  const mime = String(item.mimeType || '').toLowerCase();
  if (mime === 'application/vnd.google-apps.spreadsheet') {
    return `https://docs.google.com/spreadsheets/d/${item.remoteId}/edit`;
  }
  if (mime === 'application/vnd.google-apps.presentation') {
    return `https://docs.google.com/presentation/d/${item.remoteId}/edit`;
  }
  return `https://docs.google.com/document/d/${item.remoteId}/edit`;
}

function normalizeItem(item) {
  const rawParentId = item.parentId;

  const parentId =
    rawParentId && typeof rawParentId === 'object'
      ? rawParentId._id || rawParentId.id || null
      : rawParentId || null;
  return {
    ...item,
    id: String(item._id || item.id),
    parentId: item.parentId ? String(parentId) : null,
    accountId: String(item.accountId),
    sizeBytes: Number(item.sizeBytes || 0),
    mimeType: item.mimeType || '',
    webViewLink: item.webViewLink || '',
    updatedAt: item.updatedAtStr || item.updatedAt || '',
  };
}

const MIME_LABEL_MAP = {
  'application/vnd.google-apps.document': 'DOC',
  'application/vnd.google-apps.spreadsheet': 'SHEET',
  'application/vnd.google-apps.presentation': 'SLIDES',
  'application/vnd.google-apps.form': 'FORM',
  'application/vnd.google-apps.drawing': 'DRAWING',
  'application/pdf': 'PDF',
  'application/zip': 'ZIP',
  'application/x-zip-compressed': 'ZIP',
  'application/x-tar': 'TAR',
  'application/gzip': 'GZ',
  'application/json': 'JSON',
  'text/plain': 'TEXT',
  'text/csv': 'CSV',
  'text/html': 'HTML',
  'text/markdown': 'TEXT',
};

function getFileTypeLabel(item) {
  if (String(item.type).toLowerCase() === 'folder') {
    return 'FOLDER';
  }

  const name = String(item.name || '').trim();
  const lastDot = name.lastIndexOf('.');
  if (lastDot > 0 && lastDot < name.length - 1) {
    const ext = name.slice(lastDot + 1).toUpperCase();
    if (ext === 'TXT' || ext === 'MD' || ext === 'LOG') return 'TEXT';
    if (/^[A-Z0-9]{2,6}$/.test(ext)) return ext;
  }

  const effectiveMime = String(
    item.isShortcut && item.targetMimeType
      ? item.targetMimeType
      : item.mimeType || ''
  ).toLowerCase();

  if (MIME_LABEL_MAP[effectiveMime]) {
    return MIME_LABEL_MAP[effectiveMime];
  }

  if (effectiveMime.startsWith('text/')) return 'TEXT';
  if (effectiveMime.includes('/')) {
    const sub = effectiveMime.split('/')[1].split('+')[0].replace(/^x-/, '');
    if (sub && sub !== 'octet-stream') {
      return sub.toUpperCase().slice(0, 6);
    }
  }

  return 'FILE';
}


export default function Dashboard() {
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderHistory, setFolderHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [showSourceBadges, setShowSourceBadges] = useState(true);
  const [activeNav, setActiveNav] = useState('all'); // 'all' | 'recent'

  
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [notOwnedInfo, setNotOwnedInfo] = useState(null); // { ownerEmail, canTrash }

  const [removingAccountId, setRemovingAccountId] = useState(null);

  // Modals State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [stagedFiles, setStagedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [newProvider, setNewProvider] = useState('mega');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [syncingAccountId, setSyncingAccountId] = useState(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleRemoveAccount = async (acc) => {
    if (!acc?.id || removingAccountId) return;

    const confirmed = window.confirm(
      `Remove "${acc.alias}" (${acc.provider}) and clear its synced items from the dashboard?`
    );
    if (!confirmed) return;

    setRemovingAccountId(acc.id);
    try {
      const res = await fetch(`/api/accounts/${encodeURIComponent(acc.id)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setItems((prev) => prev.filter((item) => String(item.accountId) !== String(acc.id)));
        setAccounts((prev) => prev.filter((a) => String(a.id) !== String(acc.id)));
        await refreshDashboard();
      }
    } finally {
      setRemovingAccountId(null);
    }
  };

  // Lookup map for quick account metadata resolution
  const accountMap = useMemo(() => {
    const map = {};
    accounts.forEach((acc) => {
      map[acc.id] = acc;
    });
    return map;
  }, [accounts]);

  // Combined Storage Calculations
  const storageStats = useMemo(() => {
    const totalGB = accounts.reduce((sum, a) => sum + a.totalGB, 0);
    const usedGB = accounts.reduce((sum, a) => sum + a.usedGB, 0);
    return {
      totalGB,
      usedGB: parseFloat(usedGB.toFixed(2)),
      freeGB: parseFloat((totalGB - usedGB).toFixed(2)),
      percent: totalGB > 0 ? Math.min(100, Math.round((usedGB / totalGB) * 100)) : 0,
    };
  }, [accounts]);

  // Breadcrumb Trail Builder
  const breadcrumbs = useMemo(() => {
    const trail = [{ id: null, name: 'All Unified Files' }];
    let pointer = currentFolderId;
    const visited = new Set();

    while (pointer && !visited.has(pointer)) {
      visited.add(pointer);
      const folder = items.find((i) => i.id === pointer);
      if (!folder) break;
      trail.splice(1, 0, { id: folder.id, name: folder.name });
      pointer = folder.parentId;
    }

    return trail;
  }, [currentFolderId, items]);

  // Filtered Items (Global Search across all accounts OR current folder contents)
  const visibleItems = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();

    if (trimmed) {
      return items.filter((item) => item.name.toLowerCase().includes(trimmed));
    }

    if (activeNav === 'recent') {
      return [...items]
        .filter((i) => i.type === 'file')
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }

    return items
      .filter((item) => item.parentId === currentFolderId)
      .sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'folder' ? -1 : 1;
      });
  }, [items, currentFolderId, searchQuery, activeNav]);

  // Fetch real accounts & indexed items
  const refreshDashboard = useCallback(async () => {
    try {
      const [accRes, filesRes] = await Promise.all([
        fetch('/api/accounts', { cache: 'no-store' }),
        fetch('/api/files', { cache: 'no-store' }),
      ]);

      if (accRes.ok) {
        const accData = await accRes.json();
        if (Array.isArray(accData.accounts)) {
          setAccounts(accData.accounts.map(normalizeAccount));
        }
      }

      if (filesRes.ok) {
        const filesData = await filesRes.json();
        if (Array.isArray(filesData.items)) {
          setItems(filesData.items.map(normalizeItem));
        }
      }
    } catch (err) {
      console.error('Failed to refresh dashboard:', err);
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  useEffect(() => {
    const onFocus = () => {
      refreshDashboard();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refreshDashboard]);

  // Folder Navigation & Back State
  
  const handleEnterFolder = useCallback((folderId) => {
    setCurrentFolderId(folderId ? String(folderId) : null);
    setActiveNav('all');
    setSearchQuery('');
  }, []);


  
  const handleGoBack = useCallback(() => {
    // Exit search first
    if (searchQuery.trim()) {
      setSearchQuery('');
      return;
    }

    // Exit Recent view
    if (activeNav !== 'all') {
      setActiveNav('all');
      setCurrentFolderId(null);
      return;
    }

    // Navigate to parent folder
    if (currentFolderId !== null) {
      const currentFolder = items.find(
        (item) => String(item.id) === String(currentFolderId)
      );

      setCurrentFolderId(
        currentFolder?.parentId
          ? String(currentFolder.parentId)
          : null
      );
    }
  }, [currentFolderId, items, searchQuery, activeNav]);


  // Open Folder or File
  const handleItemOpen = (item) => {
    if (String(item.type).toLowerCase() === 'folder') {
      handleEnterFolder(item.id);
      return;
    }

    const targetUrl = isPhotoFile(item)
      ? `/api/files/${item.id}/open`
      : getOriginalLink(item);

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const showBackButton =
  currentFolderId !== null ||
  Boolean(searchQuery.trim()) ||
  activeNav !== 'all';

  const DIRECT_TEXT_EXTENSIONS = new Set([
  '.txt', '.md', '.markdown', '.csv', '.tsv', '.json', '.xml',
  '.yaml', '.yml', '.log', '.ini', '.conf', '.env', '.sql',
  '.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.htm', '.sh',
]);

function shouldOpenDirectly(item) {
  const mime = String(item.mimeType || '').toLowerCase();
  if (
    mime.startsWith('text/') ||
    mime.startsWith('video/') ||
    mime.startsWith('image/')
  ) {
    return true;
  }

  const name = String(item.name || '').toLowerCase();
  const dotIdx = name.lastIndexOf('.');
  if (dotIdx !== -1) {
    const ext = name.slice(dotIdx);
    if (DIRECT_TEXT_EXTENSIONS.has(ext)) return true;
  }

  return false;
}

function isPhotoFile(item) {
  const mime = String(
    item.isShortcut && item.targetMimeType
      ? item.targetMimeType
      : item.mimeType || ''
  ).toLowerCase();

  if (mime.startsWith('image/')) {
    return true;
  }

  const name = String(item.name || '').toLowerCase();
  return /\.(jpe?g|png|gif|webp|bmp|svg|heic|heif|avif)$/i.test(name);
}

function getOriginalLink(item) {
  if (item.webViewLink) return item.webViewLink;

  const targetId =
    item.isShortcut && item.targetRemoteId
      ? item.targetRemoteId
      : item.remoteId;

  const mime = String(
    item.isShortcut && item.targetMimeType
      ? item.targetMimeType
      : item.mimeType || ''
  ).toLowerCase();

  if (!targetId) return `/api/files/${item.id}/open`;

  if (mime === 'application/vnd.google-apps.document') {
    return `https://docs.google.com/document/d/${targetId}/edit`;
  }
  if (mime === 'application/vnd.google-apps.spreadsheet') {
    return `https://docs.google.com/spreadsheets/d/${targetId}/edit`;
  }
  if (mime === 'application/vnd.google-apps.presentation') {
    return `https://docs.google.com/presentation/d/${targetId}/edit`;
  }
  if (mime === 'application/vnd.google-apps.form') {
    return `https://docs.google.com/forms/d/${targetId}/edit`;
  }
  if (mime === 'application/vnd.google-apps.drawing') {
    return `https://docs.google.com/drawings/d/${targetId}/edit`;
  }
  if (mime === 'application/vnd.google-apps.folder') {
    return `https://drive.google.com/drive/folders/${targetId}`;
  }

  return `https://drive.google.com/file/d/${targetId}/view`;
}

  // Handle File / Folder Selection for Upload
  const handleFilesSelected = (fileList) => {
    const filesArray = Array.from(fileList);
    const staged = filesArray.map((file, idx) => {
      const targetAcc = selectDestinationAccount(
        {
          name: file.name,
          sizeBytes: file.size,
          mimeType: file.type,
          relativePath: file.webkitRelativePath || file.name,
        },
        accounts
      );

      return {
        tempId: `${Date.now()}-${idx}`,
        rawFile: file,
        name: file.name,
        relativePath: file.webkitRelativePath || '',
        sizeBytes: file.size,
        targetAccountId: targetAcc ? targetAcc.id : accounts[0]?.id,
      };
    });

    setStagedFiles((prev) => [...prev, ...staged]);
  };

  // Commit Upload & Distribute to Selected Cloud Accounts
  const handleConfirmUpload = () => {
    if (stagedFiles.length === 0) return;

    const updatedItems = [...items];
    const quotaDelta = {};
    const createdFolderCache = {};

    stagedFiles.forEach((entry, index) => {
      let targetParentId = currentFolderId;

      if (entry.relativePath && entry.relativePath.includes('/')) {
        const parts = entry.relativePath.split('/');
        parts.pop();

        parts.forEach((folderName) => {
          const cacheKey = `${targetParentId || 'root'}/${folderName}`;
          if (createdFolderCache[cacheKey]) {
            targetParentId = createdFolderCache[cacheKey];
          } else {
            const existing = updatedItems.find(
              (i) => i.type === 'folder' && i.parentId === targetParentId && i.name === folderName
            );
            if (existing) {
              targetParentId = existing.id;
              createdFolderCache[cacheKey] = existing.id;
            } else {
              const newFolderId = `folder-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
              updatedItems.push({
                id: newFolderId,
                name: folderName,
                type: 'folder',
                parentId: targetParentId,
                accountId: entry.targetAccountId,
                updatedAt: new Date().toISOString().slice(0, 10),
              });
              createdFolderCache[cacheKey] = newFolderId;
              targetParentId = newFolderId;
            }
          }
        });
      }

      updatedItems.push({
        id: `file-${Date.now()}-${index}`,
        name: entry.name,
        type: 'file',
        sizeBytes: entry.sizeBytes,
        parentId: targetParentId,
        accountId: entry.targetAccountId,
        updatedAt: new Date().toISOString().slice(0, 10),
      });

      const addedGB = entry.sizeBytes / (1024 * 1024 * 1024);
      quotaDelta[entry.targetAccountId] = (quotaDelta[entry.targetAccountId] || 0) + addedGB;
    });

    setItems(updatedItems);
    setAccounts((prev) =>
      prev.map((acc) => {
        const delta = quotaDelta[acc.id] || 0;
        return {
          ...acc,
          usedGB: parseFloat(Math.min(acc.totalGB, acc.usedGB + delta).toFixed(3)),
        };
      })
    );

    setStagedFiles([]);
    setIsUploadOpen(false);
  };

  // Create New Virtual Folder
  const handleCreateFolder = () => {
    const name = window.prompt('Enter new folder name:');
    if (!name || !name.trim()) return;

    const targetAcc = selectDestinationAccount({ name: name.trim(), sizeBytes: 0 }, accounts);
    setItems((prev) => [
      ...prev,
      {
        id: `folder-${Date.now()}`,
        name: name.trim(),
        type: 'folder',
        parentId: currentFolderId,
        accountId: targetAcc?.id || accounts[0]?.id,
        updatedAt: new Date().toISOString().slice(0, 10),
      },
    ]);
  };

  // Delete File or Folder
  const handleDeleteItem = (e, item) => {
    e.stopPropagation();
    setDeleteError('');
    setNotOwnedInfo(null);
    setItemToDelete(item);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setItemToDelete(null);
    setDeleteError('');
    setNotOwnedInfo(null);
  };

  const executeDeleteRequest = async ({ trash = false } = {}) => {
    if (!itemToDelete || isDeleting) return;

    const target = itemToDelete;
    setIsDeleting(true);
    setDeleteError('');

    try {
      const endpoint = `/api/files/${encodeURIComponent(target.id)}${trash ? '?trash=true' : ''}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data?.notOwned) {
          setNotOwnedInfo({
            ownerEmail: data.ownerEmail || 'Unknown owner',
            canTrash: Boolean(data.canTrash),
          });
          setDeleteError(data.error || 'This item is not owned by you so you cannot delete it.');
          return;
        }

        setDeleteError(data?.error || 'Could not complete delete action.');
        return;
      }

      const removedSet = new Set(
        Array.isArray(data.deletedIds) && data.deletedIds.length > 0
          ? data.deletedIds.map(String)
          : [String(target.id)]
      );

      setItems((prev) =>
        prev.filter(
          (entry) => !removedSet.has(String(entry.id)) && !removedSet.has(String(entry.parentId))
        )
      );

      if (typeof data.usedGB === 'number') {
        setAccounts((prev) =>
          prev.map((acc) =>
            String(acc.id) === String(target.accountId)
              ? { ...acc, usedGB: data.usedGB }
              : acc
          )
        );
      }

      if (currentFolderId && removedSet.has(String(currentFolderId))) {
        setCurrentFolderId(null);
        setFolderHistory([]);
      }

      setItemToDelete(null);
      setNotOwnedInfo(null);
    } catch (err) {
      setDeleteError(err?.message || 'Network error while processing delete.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Sync Single Account
  const handleSyncAccount = async (accountId) => {
    if (!accountId || syncingAccountId) return;
    setSyncingAccountId(accountId);
    try {
      const res = await fetch(`/api/accounts/${accountId}/sync`, {
        method: 'POST',
      });
      if (res.ok) {
        await refreshDashboard();
      }
    } finally {
      setSyncingAccountId(null);
    }
  };

  // Sync All Accounts
  const handleSyncAll = async () => {
    if (accounts.length === 0 || isSyncingAll) return;
    setIsSyncingAll(true);
    try {
      await Promise.all(
        accounts.map((acc) =>
          fetch(`/api/accounts/${acc.id}/sync`, { method: 'POST' })
        )
      );
      await refreshDashboard();
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Link Cloud Account
  const handleLinkAccount = async (e) => {
    e.preventDefault();

    if (newProvider === 'mega') {
      await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'mega',
          email: newEmail,
          password: newPassword,
        }),
      });
      setNewEmail('');
      setNewPassword('');
      setIsLinkModalOpen(false);
      await refreshDashboard();
    } else {
      window.location.href = `/api/auth/start/${newProvider}`;
    }
  };

  return (
    <div className="cu-app">
      {/* Left Sidebar */}
      <aside className="cu-sidebar">
        <div className="cu-brand">
          <div className="cu-brand-logo">CU</div>
          <div>
            <div className="cu-brand-title">CloudUnion</div>
            <div className="cu-brand-subtitle">Multi-Cloud Storage Pool</div>
          </div>
        </div>

        <button className="cu-upload-trigger" onClick={() => setIsUploadOpen(true)}>
          <span>+</span> Upload File / Folder
        </button>

        <nav className="cu-nav-section">
          <div className="cu-section-label">Workspace</div>
          <button
            className={`cu-nav-item ${activeNav === 'all' ? 'active' : ''}`}
            onClick={() => {
              setActiveNav('all');
              setSearchQuery('');
            }}
          >
            <span>📁</span> All Unified Files
          </button>
          <button
            className={`cu-nav-item ${activeNav === 'recent' ? 'active' : ''}`}
            onClick={() => {
              setActiveNav('recent');
              setSearchQuery('');
            }}
          >
            <span>🕒</span> Recent Uploads
          </button>
        </nav>

        {/* Linked Free-Tier Accounts */}
        <div className="cu-accounts-list">
          <div className="cu-section-label">
            <span>Linked Clouds ({accounts.length})</span>
            <button className="cu-link-btn" onClick={() => setIsLinkModalOpen(true)}>
              + Link
            </button>
          </div>

          {accounts.map((acc) => {
            const pct = Math.min(100, Math.round((acc.usedGB / acc.totalGB) * 100));
            return (
              <div key={acc.id} className="cu-account-card">
                <div className="cu-account-header">
                  <div className="cu-account-info">
                    <span className={`cu-provider-dot ${acc.provider}`} />
                    <span className="cu-account-alias">{acc.alias}</span>
                  </div>
                  <div className="cu-account-actions">
                    <span className="cu-account-quota-text">
                      {acc.usedGB.toFixed(1)} / {acc.totalGB} GB
                    </span>
                    <button
                      type="button"
                      className="cu-sync-btn"
                      disabled={syncingAccountId === acc.id || isSyncingAll}
                      onClick={() => handleSyncAccount(acc.id)}
                      title={`Sync ${acc.alias} files and quota`}
                    >
                      {syncingAccountId === acc.id ? 'Syncing...' : 'Sync'}
                    </button>
                    <button
                      type="button"
                      className="cu-sync-btn"
                      disabled={removingAccountId === acc.id || syncingAccountId === acc.id || isSyncingAll}
                      onClick={() => handleRemoveAccount(acc)}
                      title={`Unlink and remove ${acc.alias}`}
                    >
                      {removingAccountId === acc.id ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </div>
                <div className="cu-mini-bar-bg">
                  <progress className={`cu-mini-bar-fill ${acc.provider}`} value={pct} max="100" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Aggregated Total Pool Capacity */}
        <div className="cu-storage-summary">
          <div className="cu-storage-header">
            <span>Combined Pool</span>
            <span>
              {storageStats.usedGB} / {storageStats.totalGB} GB
            </span>
          </div>
          <div className="cu-total-bar-bg">
            <progress className="cu-total-bar-fill" value={storageStats.percent} max="100" />
          </div>
          <div className="cu-storage-subtext">
            {storageStats.freeGB} GB free across {accounts.length} linked accounts
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="cu-main">
        {/* Top Search & Controls */}
        <header className="cu-topbar">
          <div className="cu-search-wrapper">
            <span className="cu-search-icon">🔍</span>
            <input
              type="text"
              className="cu-search-input"
              placeholder="Search across Google Drive, MEGA, Box & pCloud..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="cu-search-clear" onClick={() => setSearchQuery('')}>
                ✕
              </button>
            )}
          </div>

          <div className="cu-topbar-actions">
            <button
              type="button"
              className="cu-sync-all-btn"
              disabled={isSyncingAll || accounts.length === 0}
              onClick={handleSyncAll}
            >
              {isSyncingAll ? 'Syncing All...' : 'Sync All'}
            </button>

            <button
              className={`cu-toggle-pill ${showSourceBadges ? 'active' : ''}`}
              onClick={() => setShowSourceBadges((prev) => !prev)}
            >
              {showSourceBadges ? 'Hide Cloud Tags' : 'Show Cloud Tags'}
            </button>

            <div className="cu-view-switcher">
              <button
                className={`cu-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
              <button
                className={`cu-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </button>
            </div>
          </div>
        </header>

        {/* Sub-bar: Back, Breadcrumbs & New Folder */}
        <div className="cu-subbar">
          <div className="cu-breadcrumbs-group">
            {showBackButton && (
              <button
                type="button"
                className="cu-back-btn"
                onClick={handleGoBack}
                title="Go back to previous folder"
              >
                ← Back
              </button>
            )}
            <div className="cu-breadcrumbs">
              {searchQuery ? (
                <span className="cu-crumb-btn current">
                  Search results for &ldquo;{searchQuery}&rdquo; ({visibleItems.length})
                </span>
              ) : activeNav === 'recent' ? (
                <span className="cu-crumb-btn current">Recent Uploads Across All Clouds</span>
              ) : (
                breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  return (
                    <React.Fragment key={crumb.id || 'root'}>
                      {idx > 0 && <span className="cu-crumb-sep">/</span>}
                      <button
                        type="button"
                        className={`cu-crumb-btn ${isLast ? 'current' : ''}`}
                        onClick={() => {
                          if (!isLast) {
                            handleEnterFolder(crumb.id);
                          }
                        }}
                      >
                        {crumb.name}
                      </button>
                    </React.Fragment>
                  );
                })
              )}
            </div>

            {!searchQuery && activeNav === 'all' && (
              <button type="button" className="cu-new-folder-btn" onClick={handleCreateFolder}>
                + New Folder
              </button>
            )}
          </div>
        </div>

        {/* Unified Explorer Canvas */}
        <section className="cu-explorer-body">
          {visibleItems.length === 0 ? (
            <div className="cu-empty-state">
              <div className="cu-empty-title">No files or folders found</div>
              <div>Upload files or try a different search term across your linked accounts.</div>
            </div>
          ) : viewMode === 'list' ? (
            <div className="cu-table-container">
              <table className="cu-file-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    {showSourceBadges && <th>Stored In</th>}
                    <th>Size</th>
                    <th>Modified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map((item) => {
                    const acc = accountMap[item.accountId];
                    const isFolder = item.type === 'folder';
                    const typeLabel = getFileTypeLabel(item);
                    return (
                      <tr
                        key={item.id}
                        className={`cu-file-row ${isFolder ? 'folder' : ''}`}
                        onClick={() => handleItemOpen(item)}
                      >
                        <td>
                          <div className="cu-name-cell">
                            <span className="cu-item-icon">{isFolder ? '📁' : '📄'}</span>
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="cu-type-pill">{typeLabel}</span>
                        </td>
                        {showSourceBadges && (
                          <td>
                            {acc && (
                              <span className={`cu-source-badge ${acc.provider}`}>
                                {acc.alias}
                              </span>
                            )}
                          </td>
                        )}
                        <td>{isFolder ? '—' : formatBytes(item.sizeBytes)}</td>
                        <td>{item.updatedAt}</td>
                        <td>
                          <button
                            type="button"
                            className="cu-delete-btn"
                            title="Delete item"
                            onClick={(e) => handleDeleteItem(e, item)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="cu-grid-container">
              {visibleItems.map((item) => {
                const acc = accountMap[item.accountId];
                const isFolder = item.type === 'folder';
                const typeLabel = getFileTypeLabel(item);
                return (
                  <div
                    key={item.id}
                    className={`cu-grid-card ${isFolder ? 'folder' : ''}`}
                    onClick={() => handleItemOpen(item)}
                  >
                    <div className="cu-grid-top">
                      <span className="cu-grid-icon">{isFolder ? '📁' : '📄'}</span>
                      {showSourceBadges && acc && (
                        <span className={`cu-source-badge ${acc.provider}`}>{acc.alias}</span>
                      )}
                    </div>
                    <div className="cu-grid-name" title={item.name}>
                      {item.name}
                    </div>
                    <div className="cu-grid-meta">
                      <span className="cu-grid-meta-info">
                        <span className="cu-type-pill">{typeLabel}</span>
                        <span>{isFolder ? '' : formatBytes(item.sizeBytes)}</span>
                      </span>
                      <button
                        type="button"
                        className="cu-delete-btn"
                        onClick={(e) => handleDeleteItem(e, item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Upload & Smart Distribution Modal */}
      {isUploadOpen && (
        <div className="cu-modal-backdrop" onClick={() => setIsUploadOpen(false)}>
          <div className="cu-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cu-modal-header">
              <div className="cu-modal-title">Upload & Distribute to Cloud Pool</div>
              <button type="button" className="cu-modal-close" onClick={() => setIsUploadOpen(false)}>
                ✕
              </button>
            </div>

            <div className="cu-modal-body">
              <div
                className={`cu-dropzone ${isDragging ? 'dragging' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files?.length) {
                    handleFilesSelected(e.dataTransfer.files);
                  }
                }}
              >
                <div className="cu-dropzone-text">Drag & drop files here to stage</div>
                <div className="cu-dropzone-subtext">
                  Files are routed automatically via selectDestinationAccount()
                </div>

                <div className="cu-upload-actions-row">
                  <button
                    type="button"
                    className="cu-secondary-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select Files
                  </button>
                  <button
                    type="button"
                    className="cu-secondary-btn"
                    onClick={() => folderInputRef.current?.click()}
                  >
                    Select Folder
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="cu-hidden-input"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                />
                <input
                  ref={folderInputRef}
                  type="file"
                  webkitdirectory="true"
                  directory="true"
                  multiple
                  className="cu-hidden-input"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                />
              </div>

              {stagedFiles.length > 0 && (
                <div className="cu-queue-list">
                  {stagedFiles.map((item) => {
                    const targetAcc = accountMap[item.targetAccountId];
                    return (
                      <div key={item.tempId} className="cu-queue-item">
                        <span className="cu-queue-file" title={item.relativePath || item.name}>
                          {item.relativePath || item.name}
                        </span>
                        <div className="cu-queue-target">
                          <span>→</span>
                          {targetAcc && (
                            <span className={`cu-source-badge ${targetAcc.provider}`}>
                              {targetAcc.alias}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="cu-modal-footer">
              <button
                type="button"
                className="cu-secondary-btn"
                onClick={() => {
                  setStagedFiles([]);
                  setIsUploadOpen(false);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cu-primary-btn"
                disabled={stagedFiles.length === 0}
                onClick={handleConfirmUpload}
              >
                Distribute & Upload ({stagedFiles.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Cloud Account Modal */}
      {isLinkModalOpen && (
        <div className="cu-modal-backdrop" onClick={() => setIsLinkModalOpen(false)}>
          <div className="cu-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cu-modal-header">
              <div className="cu-modal-title">Link Free-Tier Cloud Account</div>
              <button type="button" className="cu-modal-close" onClick={() => setIsLinkModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleLinkAccount}>
              <div className="cu-modal-body">
                <div className="cu-form-group">
                  <label className="cu-label">Cloud Provider</label>
                  <select
                    className="cu-select"
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value)}
                  >
                    <option value="mega">MEGA (20 GB Free Tier)</option>
                    <option value="gdrive">Google Drive (15 GB Free Tier)</option>
                    <option value="box">Box (10 GB Free Tier)</option>
                    <option value="pcloud">pCloud (10 GB Free Tier)</option>
                  </select>
                </div>

                <div className="cu-form-group">
                  <label className="cu-label">Account Email</label>
                  <input
                    type="email"
                    required
                    className="cu-input"
                    placeholder="e.g. yourname+mega02@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>

                {newProvider === 'mega' && (
                  <div className="cu-form-group">
                    <label className="cu-label">MEGA Password</label>
                    <input
                      type="password"
                      required
                      className="cu-input"
                      placeholder="Enter MEGA password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="cu-modal-footer">
                <button
                  type="button"
                  className="cu-secondary-btn"
                  onClick={() => setIsLinkModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="cu-primary-btn">
                  Authorize & Link Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Popup */}
      {itemToDelete && (
        <div className="cu-modal-backdrop" onClick={closeDeleteModal}>
          <div className="cu-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cu-modal-header">
              <div className="cu-modal-title">
                {notOwnedInfo ? 'Not Owned By You' : 'Confirm Deletion'}
              </div>
              <button
                type="button"
                className="cu-modal-close"
                disabled={isDeleting}
                onClick={closeDeleteModal}
              >
                ✕
              </button>
            </div>

            <div className="cu-modal-body">
              {notOwnedInfo ? (
                <>
                  <p className="cu-confirm-text">
                    <strong>{itemToDelete.name}</strong> is not owned by you, so you cannot
                    permanently delete it.
                  </p>
                  <p className="cu-confirm-subtext">
                    <strong>Owner:</strong> {notOwnedInfo.ownerEmail}
                  </p>
                  <p className="cu-confirm-subtext">
                    {notOwnedInfo.canTrash
                      ? 'This item can be moved to Trash instead. Do you want to move it to Trash?'
                      : 'This item cannot be moved to Trash with your current permissions.'}
                  </p>
                </>
              ) : (
                <>
                  <p className="cu-confirm-text">
                    Are you sure you want to permanently delete{' '}
                    <strong>{itemToDelete.name}</strong>?
                  </p>
                  <p className="cu-confirm-subtext">
                    This will remove it from your database and permanently delete it from the linked cloud
                    account
                    {accountMap[itemToDelete.accountId]?.alias
                      ? ` (${accountMap[itemToDelete.accountId].alias})`
                      : ''}
                    .
                  </p>
                </>
              )}

              {deleteError && !notOwnedInfo && (
                <div className="cu-error-banner">{deleteError}</div>
              )}
            </div>

            <div className="cu-modal-footer">
              <button
                type="button"
                className="cu-secondary-btn"
                disabled={isDeleting}
                onClick={closeDeleteModal}
              >
                Cancel
              </button>

              {notOwnedInfo ? (
                notOwnedInfo.canTrash && (
                  <button
                    type="button"
                    className="cu-danger-btn"
                    disabled={isDeleting}
                    onClick={() => executeDeleteRequest({ trash: true })}
                  >
                    {isDeleting ? 'Moving to Trash...' : 'Move to Trash'}
                  </button>
                )
              ) : (
                <button
                  type="button"
                  className="cu-danger-btn"
                  disabled={isDeleting}
                  onClick={() => executeDeleteRequest({ trash: false })}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}