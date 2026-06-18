import { NextResponse } from 'next/server';
import Donation from '@/models/Donation'; 
// Make sure to also import whatever file connects to your database!
import dbConnect from "@/app/lib/dbConnect"; // (Update this path to your actual DB connection file)

export async function GET(request) {
    try {
        // 1. Connect to the database
        await dbConnect();

        // 2. Extract the order_id from the URL the frontend called
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('order_id');

        if (!orderId) {
            return NextResponse.json({ error: "Order ID missing" }, { status: 400 });
        }

        // 3. THIS is where Mongoose is allowed to run!
        const donation = await Donation.findOne({ orderId: orderId });

        if (!donation) {
            return NextResponse.json({ error: "Donation not found" }, { status: 404 });
        }

        // 4. Send the data safely back to the frontend
        return NextResponse.json({
            seva_name: donation.donatedFor, // Send back whatever your frontend translation map needs!
            amount: donation.amount
        }, { status: 200 });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}