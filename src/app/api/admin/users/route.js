import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import dbConnect from "@/app/lib/dbConnect";
import User from "@/models/User";

// GET all users
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await dbConnect();
  const users = await User.find({}).sort({ createdAt: -1 });
  return NextResponse.json({ success: true, users });
}

// POST: Add new Gmail or Update existing user's name and role
export async function POST(request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { name, email, role } = await request.json();
  if (!email || !role || !name) {
    return NextResponse.json({ error: "Name, email, and role are required" }, { status: 400 });
  }

  await dbConnect();

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { name: name.trim(), role },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true, user });
}

// DELETE: Remove a Gmail and revoke access
export async function DELETE(request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  if (email.toLowerCase().trim() === session.user.email?.toLowerCase().trim()) {
    return NextResponse.json(
      { error: "You cannot delete your own active admin account!" },
      { status: 400 }
    );
  }

  await dbConnect();
  await User.findOneAndDelete({ email: email.toLowerCase().trim() });

  return NextResponse.json({ success: true });
}