import TotalDonations from '@/models/TotalDonations';
import dbConnect from "@/app/lib/dbConnect";
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();
        
        // Extract the search parameter from the URL
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');

        // Build the aggregation pipeline dynamically
        const pipeline = [];

        // 1. If there is a search term, filter the raw records FIRST (this makes it very fast)
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { phone: { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }

        // 2. Sort to ensure we get the latest info (address/pan) when grouping
        pipeline.push({ $sort: { createdAt: -1 } });

        // 3. Group by phone to get unique donors
        pipeline.push({
            $group: {
                _id: "$phone",
                name: { $first: "$name" },
                phone: { $first: "$phone" },
                pan: { $first: "$pan" },
                address: { $first: "$address" },
                donationCount: { $sum: 1 } 
            }
        });

        // 4. Sort the final unique list alphabetically by name
        pipeline.push({ $sort: { name: 1 } });

        const donors = await TotalDonations.aggregate(pipeline);

        return NextResponse.json({ success: true, data: donors }, { status: 200 });

    } catch (error) {
        console.error("Donors Fetch Error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch donors" }, { status: 500 });
    }
}