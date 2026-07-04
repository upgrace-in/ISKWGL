import TotalDonations from '@/models/TotalDonations';
import dbConnect from "@/app/lib/dbConnect";
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get('phone');

        if (!phone) {
            return NextResponse.json({ success: false, message: "Phone number required" }, { status: 400 });
        }

        // await connectDB();
        
        // Find one entry matching the phone number
        const donor = await TotalDonations.findOne({ phone }).sort({ createdAt: -1 });

        if (donor) {
            return NextResponse.json({ success: true, donor });
        } else {
            return NextResponse.json({ success: true, donor: null, message: "New phone number" });
        }

    } catch (err) {
        console.error("API Search Error:", err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}