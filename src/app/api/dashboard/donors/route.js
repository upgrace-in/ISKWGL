import TotalDonations from '@/models/TotalDonations';
import DonorFollowUp from '@/models/DonorFollowUp';
import dbConnect from "@/app/lib/dbConnect";
import { NextResponse } from 'next/server';
import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
    try {
        // 1. Authenticate session & check role
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const pipeline = [];
        const matchConditions = {};

        // 2. Role-Based Access Control: Restrict users to their assigned donors
        if (session.user.role === 'donor_care' || session.user.role === 'friend_raiser') {
            matchConditions.assignedTo = session.user.email;
        }

        if (search) {
            matchConditions.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        if (startDate || endDate) {
            matchConditions.donationDate = {};

            if (startDate) {
                matchConditions.donationDate.$gte = new Date(startDate);
            }

            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchConditions.donationDate.$lte = end;
            }
        }

        if (Object.keys(matchConditions).length > 0) {
            pipeline.push({ $match: matchConditions });
        }

        // Sort raw records to bring latest donation first
        pipeline.push({ $sort: { donationDate: -1 } });

        // Group unique donors by phone & capture assignedTo
        pipeline.push({
            $group: {
                _id: "$phone",
                name: { $first: "$name" },
                phone: { $first: "$phone" },
                pan: { $first: "$pan" },
                address: { $first: "$address" },
                assignedTo: { $first: "$assignedTo" }, 
                latestDonationDate: { $first: "$donationDate" },
                donationCount: { $sum: 1 } 
            }
        });

        // Format latest donation date string
        pipeline.push({
            $addFields: {
                latestDonationDate: {
                    $dateToString: { format: "%d %B %Y", date: "$latestDonationDate" }
                }
            }
        });

        // Efficient $lookup with formatted followupDate inside the lookup sub-pipeline
        pipeline.push({
            $lookup: {
                from: "donorfollowups", 
                let: { donorPhone: "$phone" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$donorPhone", "$$donorPhone"] } } },
                    { $sort: { followupDate: -1, createdAt: -1 } },
                    { $limit: 1 }, // Fetches ONLY the single latest follow-up note per donor
                    {
                        $addFields: {
                            followupDate: {
                                $cond: {
                                    if: "$followupDate",
                                    then: { $dateToString: { format: "%d %B %Y", date: "$followupDate" } },
                                    else: null
                                }
                            }
                        }
                    }
                ],
                as: "latestFollowUpArr"
            }
        });

        // Flatten lookup array
        pipeline.push({
            $addFields: {
                latestFollowUp: { $arrayElemAt: ["$latestFollowUpArr", 0] }
            }
        });

        // Clean up temporary array
        pipeline.push({
            $project: {
                latestFollowUpArr: 0
            }
        });

        // Sort alphabetically by name
        pipeline.push({ $sort: { name: 1 } });

        const donors = await TotalDonations.aggregate(pipeline);

        return NextResponse.json({ success: true, data: donors }, { status: 200 });

    } catch (error) {
        console.error("Donors Fetch Error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch donors" }, { status: 500 });
    }
}

// 3. PUT Handler: Allows Admin to assign/reassign donors by phone number
export async function PUT(req) {
    try {
        const session = await auth();
        if (session?.user?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await dbConnect();
        const { phone, assignedToEmail } = await req.json();

        if (!phone) {
            return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
        }

        // Update all donation records sharing this phone number
        await TotalDonations.updateMany(
            { phone },
            { $set: { assignedTo: assignedToEmail || "" } }
        );

        return NextResponse.json({ success: true, message: "Donor assigned successfully" }, { status: 200 });

    } catch (error) {
        console.error("Donor Assignment Error:", error);
        return NextResponse.json({ success: false, message: "Failed to assign donor" }, { status: 500 });
    }
}