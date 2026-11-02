import DonorFollowUp from '@/models/DonorFollowUp';
import dbConnect from "@/app/lib/dbConnect";
import { NextResponse } from 'next/server';

// GET: Fetch all notes for a specific donor
export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { phone } = await params;

        // Fetch notes sorted by newest first (or oldest first for chat flow)
        const followUps = await DonorFollowUp.find({ 
            donorPhone: phone
        }).sort({ createdAt: 1 });

        return NextResponse.json({ success: true, data: followUps }, { status: 200 });
    } catch (error) {
        console.error("Fetch Follow-ups Error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch follow-ups" }, { status: 500 });
    }
}

// POST: Add a new note/follow-up message
export async function POST(req, { params }) {
    try {
        await dbConnect();
        const { phone } = await params;
        const body = await req.json();
        const { text, donorPhone, author, followupDate } = body;

        if (!text || !text.trim()) {
            return NextResponse.json({ success: false, message: "Follow-up text cannot be empty" }, { status: 400 });
        }

        const newFollowUp = await DonorFollowUp.create({
            donorPhone: donorPhone || phone,
            text: text.trim(),
            author: author?.trim() || "Devotee",
            followupDate: followupDate ? new Date(followupDate) : new Date()
        });

        return NextResponse.json({ success: true, data: newFollowUp }, { status: 201 });
    } catch (error) {
        console.error("Create Follow-up Error:", error);
        return NextResponse.json({ success: false, message: "Failed to save follow-up" }, { status: 500 });
    }
}