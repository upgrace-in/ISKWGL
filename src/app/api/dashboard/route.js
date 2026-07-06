import TotalDonations from '@/models/TotalDonations'; // Ensure this points to your actual Mongoose model
import dbConnect from "@/app/lib/dbConnect";
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        let query = {};

        // --- FILTERS (Stacking multiple conditions) ---

        // 1. Filter by Seva Name (Case-insensitive)
        const sevaName = searchParams.get('sevaName');
        if (sevaName) query.seva = { $regex: sevaName, $options: 'i' }; 

        // 2. Filter by Name (Case-insensitive partial match)
        const name = searchParams.get('name');
        if (name) query.name = { $regex: name, $options: 'i' };

        // // 3. Filter by PIN (Exact match)
        // const pin = searchParams.get('pin');
        // if (pin) query.pin = pin;
        

        // 5. Filter by Message Sent (Boolean)
        const messageSent = searchParams.get('messageSent');
        if (messageSent !== null && messageSent !== '') {
            // Convert string "true"/"false" to actual boolean for MongoDB
            query.messageSent = messageSent === 'true';
        }

        // 8. Filter by Source
        const source = searchParams.get('source');
        if (source) {
            query.source = source;
        }

        // --- SEARCH (Looking across specific fields) ---

        // 6. Search for Order ID OR Phone Number
        const search = searchParams.get('search');
        if (search) {
            query.$or = [
                { orderId: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        // 7. Date Filtering
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        
        if (startDate || endDate) {
            query.donationDate = {};
            
            if (startDate) {
                query.donationDate.$gte = new Date(startDate);
            }
            
            if (endDate) {
                // Set the end date to the very last millisecond of that day
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.donationDate.$lte = end;
            }
        }

        // Fetch records, sorted by the 'donationDates' time (newest first)
        const records = await TotalDonations.find(query).sort({ donationDate: -1 });

        return NextResponse.json({ success: true, count: records.length, data: records }, { status: 200 });

    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch data" }, { status: 500 });
    }
}