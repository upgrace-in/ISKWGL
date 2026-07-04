import TotalDonations from '@/models/TotalDonations';
import dbConnect from "@/app/lib/dbConnect";
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const phone = params.phone;

        // Find all donations by this exact phone number
        const donations = await TotalDonations.find({ phone: phone }).sort({ createdAt: -1 });

        if (!donations || donations.length === 0) {
            return NextResponse.json({ success: false, message: "Donor not found" }, { status: 404 });
        }

        // We can extract the donor's personal info from their most recent transaction record
        const personalInfo = {
            name: donations[0].name,
            phone: donations[0].phone,
            email: donations[0].email || 'abc@test',
            address: donations[0].address,
            pan: donations[0].pan,
            dob: donations[0].dob
        };

        return NextResponse.json({ success: true, personalInfo, donations }, { status: 200 });

    } catch (error) {
        console.error("Profile Fetch Error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}