import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import VirtualItem from '@/models/VirtualItem';

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.trim();

  const filter = query
    ? { name: { $regex: query, $options: 'i' } }
    : {};

  const items = await VirtualItem.find(filter).sort({ type: -1, name: 1 }).lean();
  return NextResponse.json({ items });
}