import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import CloudAccount from '@/models/CloudAccount';
import VirtualItem from '@/models/VirtualItem';

export async function DELETE(req, context) {
  try {
    const resolvedParams = await context.params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    await dbConnect();

    const account = await CloudAccount.findByIdAndDelete(id);
    if (!account) {
      return NextResponse.json({ error: 'Cloud account not found' }, { status: 404 });
    }

    await VirtualItem.deleteMany({ accountId: account._id });

    return NextResponse.json({
      ok: true,
      removedAccountId: String(account._id),
    });
  } catch (err) {
    console.error('[accounts/delete] error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to remove cloud account' },
      { status: 500 }
    );
  }
}