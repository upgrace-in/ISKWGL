import TotalDonations from '@/models/TotalDonations';
import dbConnect from "@/app/lib/dbConnect";
import { NextResponse } from 'next/server';
import { auth } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic'; // Ensures the route is always dynamic

export async function GET(req) {
    try {
        // 1. Authenticate user session
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        // Default to the current year
        const currentYear = new Date().getFullYear();
        const year = parseInt(currentYear);

        // Define the start and end of that specific year
        const startDate = new Date(year, 0, 1); // Jan 1st, 00:00:00
        const endDate = new Date(year + 1, 0, 1); // Jan 1st of NEXT year, 00:00:00

        // 2. Build match conditions (Date range + RBAC check)
        const matchConditions = {
            donationDate: {
                $gte: startDate,
                $lt: endDate
            }
        };

        // If user is 'friend_raiser', restrict matching records to their assigned donors
        if (session.user.role === 'friend_raiser') {
            matchConditions.assignedTo = session.user.email;
        }

        const topDonors = await TotalDonations.aggregate([
            // 1. Match: Filter by year and assigned caregiver (if friend_raiser)
            {
                $match: matchConditions
            },
            // 2. Group: Combine records with the same phone number
            {
                $group: {
                    _id: "$phone", // Group by phone number
                    name: { $first: "$name" }, // Grab their name
                    phone: { $first: "$phone" }, // Retain phone for links/keys
                    donationCount: { $sum: 1 }, // Count how many times they appear
                    totalAmount: { $sum: { $toInt: "$amount" } } // Sum up total money
                }
            },
            // 3. Sort: Order by donation count, then total amount
            {
                $sort: { donationCount: -1, totalAmount: -1 }
            },
            // 4. Limit: Grab the top 3
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