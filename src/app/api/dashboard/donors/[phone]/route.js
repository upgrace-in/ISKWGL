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

// 2. PUT: Update DOB and Address across ALL entries for this phone number
export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { phone } = params;
        const body = await request.json();
        const { email, pan, dob, address } = body;

        // updateMany updates EVERY donation document with this phone number
        const result = await TotalDonations.updateMany(
            { phone: phone },
            { 
                $set: { 
                    email: email,
                    pan: pan ? pan.toUpperCase() : "",
                    dob: dob ? new Date(dob) : null,
                    // If your schema stores address as an object:
                    address: address
                    
                    // Note: If your schema stores address fields as flat properties, 
                    // un-comment the lines below instead:
                    /*
                    "addressLine1": address.addressLine1,
                    "addressLine2": address.addressLine2,
                    "city": address.city,
                    "district": address.district,
                    "state": address.state,
                    "pinCode": address.pinCode
                    */
                } 
            }
        );

        return NextResponse.json({ 
            success: true, 
            message: `Updated ${result.modifiedCount} records successfully.` 
        });
    } catch (error) {
        console.error("PUT Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}