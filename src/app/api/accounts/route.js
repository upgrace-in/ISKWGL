import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import dbConnect from '@/app/lib/dbConnect';
import CloudAccount from '@/models/CloudAccount';
import VirtualItem from '@/models/VirtualItem';
import { encryptCreds, fetchProviderState } from '@/app/lib/providers';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await dbConnect();
    const accounts = await CloudAccount.find().select('-encryptedCredentials').lean();
    return NextResponse.json({ accounts });
  } catch (err) {
    console.error('[accounts/get] error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

// Used for MEGA direct credential linking

export async function POST(req) {
  let createdAccountId = null;
  let storage = null;

  try {
    await dbConnect();

    const body = await req.json();
    const { provider, email, password } = body || {};

    if (provider !== 'mega') {
      return NextResponse.json(
        { error: 'Use OAuth start route for this provider' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email || '').trim();
    const cleanPassword = String(password || '');

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { error: 'MEGA email and password are required' },
        { status: 400 }
      );
    }

    // 1. Authenticate directly with MEGA
    const { Storage: MegaStorage } = await import('megajs');

    storage = new MegaStorage({
      email: cleanEmail,
      password: cleanPassword,
      autoload: true,
      keepalive: false,
    });

    await storage.ready;

    console.log('[mega/link] Authentication successful');

    // 2. Serialize the authenticated session
    if (typeof storage.toJSON !== 'function') {
      throw new Error(
        'Installed megajs version does not support session serialization'
      );
    }

    const sessionJson = storage.toJSON();

    if (!sessionJson) {
      throw new Error('MEGA returned an empty session');
    }

    // 3. Save credentials and complete session encrypted
    const count =
      (await CloudAccount.countDocuments({ provider: 'mega' })) + 1;

    const alias = `mega_${String(count).padStart(2, '0')}`;

    const account = await CloudAccount.create({
      provider: 'mega',
      alias,
      email: cleanEmail,

      encryptedCredentials: encryptCreds({
        email: cleanEmail,
        password: cleanPassword,
        sessionJson,
      }),

      totalGB: 20,
      usedGB: 0,
    });

    createdAccountId = account._id;

    console.log('[mega/link] Account created:', account._id.toString());

    // 4. Fetch initial account information and files
    const state = await fetchProviderState(account);

    const syncBatchId = randomUUID();

    account.usedGB = Number(Number(state.usedGB || 0).toFixed(2));
    account.totalGB = Number(Number(state.totalGB || 20).toFixed(2));
    account.lastSyncedAt = new Date();

    await account.save();

    // 5. Save initial virtual file structure
    if (Array.isArray(state.items) && state.items.length > 0) {
      const withIds = state.items.map((item) => ({
        ...item,
        _id: new mongoose.Types.ObjectId(),
        accountId: account._id,
        syncBatchId,
        parentId: null,
      }));

      const folderIdMap = new Map();

      for (const doc of withIds) {
        if (doc.type === 'folder' && doc.remoteId) {
          folderIdMap.set(String(doc.remoteId), doc._id);
        }
      }

      const docsToInsert = withIds.map((doc) => ({
        ...doc,
        parentId: doc.remoteParentId
          ? folderIdMap.get(String(doc.remoteParentId)) || null
          : null,
      }));

      await VirtualItem.insertMany(docsToInsert, {
        ordered: false,
      });
    }

    console.log('[mega/link] Initial sync completed:', {
      accountId: account._id.toString(),
      syncedItems: state.items?.length || 0,
    });

    return NextResponse.json({
      success: true,
      accountId: account._id,
      alias: account.alias,
      syncedItems: state.items?.length || 0,
    });

  } catch (err) {
    console.error('[mega/link] error:', err);

    // 6. Clean up partially created account if linking fails
    if (createdAccountId) {
      await Promise.allSettled([
        VirtualItem.deleteMany({
          accountId: createdAccountId,
        }),
        CloudAccount.findByIdAndDelete(createdAccountId),
      ]);
    }

    return NextResponse.json(
      {
        error: err?.message || 'Failed to link MEGA account',
      },
      { status: 500 }
    );

  }
}
