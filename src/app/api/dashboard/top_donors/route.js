import TotalDonations from '@/models/TotalDonations';
import dbConnect from "@/app/lib/dbConnect";
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensures the route is always dynamic

export async function GET(req) {
    try {
        await dbConnect();
        
        // const { searchParams } = new URL(req.url);
        
        // Default to the current year if no year is provided
        const currentYear = new Date().getFullYear();
        const year = parseInt(currentYear);

        // Define the start and end of that specific year
        const startDate = new Date(year, 0, 1); // Jan 1st, 00:00:00
        const endDate = new Date(year + 1, 0, 1); // Jan 1st of NEXT year, 00:00:00

        const topDonors = await TotalDonations.aggregate([
            // 1. Match: Filter documents to only include the specified year
            {
                $match: {
                    donationDate: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
            },
            // 2. Group: Combine records with the same phone number
            {
                $group: {
                    _id: "$phone", // Group by phone number
                    name: { $first: "$name" }, // Grab their name
                    donationCount: { $sum: 1 }, // Count how many times they appear
                    totalAmount: { $sum: { $toInt: "$amount" } } // Sum up their total money (optional but helpful)
                }
            },
            // 3. Sort: Order by donation count, then by total amount for tie-breaking
            {
                $sort: { donationCount: -1, totalAmount: -1 }
            },
            // 4. Limit: Only grab the top 3
            {
                $limit: 3
            }
        ]);

        return NextResponse.json({ success: true, topDonors });

    } catch (error) {
        console.error("Error fetching top donors:", error);
        return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
}