import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import CloudAccount from '@/models/CloudAccount';
import VirtualItem from '@/models/VirtualItem';
import { encryptCreds, fetchProviderState } from '@/app/lib/providers';

export async function GET() {
  await dbConnect();
  const accounts = await CloudAccount.find().select('-encryptedCredentials').lean();
  return NextResponse.json({ accounts });
}

// Used for MEGA direct credential linking
export async function POST(req) {
  await dbConnect();
  const { provider, email, password } = await req.json();

  if (provider !== 'mega') {
    return NextResponse.json({ error: 'Use OAuth start route for this provider' }, { status: 400 });
  }

  const count = (await CloudAccount.countDocuments({ provider: 'mega' })) + 1;
  const alias = `mega_${String(count).padStart(2, '0')}`;

  const account = await CloudAccount.create({
    provider: 'mega',
    alias,
    email,
    encryptedCredentials: encryptCreds({ email, password }),
    totalGB: 20,
  });

  // Immediately fetch real files & quota from MEGA
  const state = await fetchProviderState(account);
  account.usedGB = parseFloat(state.usedGB.toFixed(2));
  account.totalGB = parseFloat(state.totalGB.toFixed(2));
  account.lastSyncedAt = new Date();
  await account.save();

  if (state.items.length > 0) {
    await VirtualItem.insertMany(
      state.items.map((item) => ({
        ...item,
        parentId: null, // Root sync; extend with remoteParentId mapping as needed
        accountId: account._id,
      }))
    );
  }

  return NextResponse.json({ success: true, accountId: account._id });
}