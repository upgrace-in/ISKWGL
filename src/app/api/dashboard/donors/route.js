import TotalDonations from '@/models/TotalDonations';
import DonorFollowUp from '@/models/DonorFollowUp';
import dbConnect from "@/app/lib/dbConnect";
import { NextResponse } from 'next/server';
import { auth } from "@/app/lib/auth";

export async function GET(req) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // 🔍 DIAGNOSTIC LOGGING: Proactively log any documents with out-of-range dates 
        // (Years > 9999 or < year 0, or malformed numeric timestamps)
        try {
            const badRecords = await TotalDonations.find({
                $or: [
                    { donationDate: { $gt: new Date("9999-12-31T23:59:59Z") } },
                    { donationDate: { $gt: 3250368000000 } }, // Milliseconds threshold for year 10000
                    { donationDate: { $lt: 0 } }
                ]
            }).lean();

            if (badRecords && badRecords.length > 0) {
                console.warn(`[MongoDB Warning] Found ${badRecords.length} donor document(s) with corrupted/out-of-range dates:`, 
                    badRecords.map(doc => ({ id: doc._id, name: doc.name, phone: doc.phone, donationDate: doc.donationDate }))
                );
            }
        } catch (diagError) {
            console.error("[Diagnostic Log Error] Failed to scan for bad records:", diagError);
        }

        const pipeline = [];
        const matchConditions = {};

        if (session.user.role === 'friend_raiser') {
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

        pipeline.push({ $sort: { donationDate: -1 } });

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

        // Safe conversion and formatting
        pipeline.push({
            $addFields: {
                parsedDonationDate: {
                    $cond: {
                        if: {
                            $and: [
                                { $ne: ["$latestDonationDate", null] },
                                { $in: [{ $type: "$latestDonationDate" }, ["date", "long", "int", "double", "string"]] }
                            ]
                        },
                        then: { $toDate: "$latestDonationDate" },
                        else: null
                    }
                }
            }
        });

        pipeline.push({
            $addFields: {
                latestDonationDate: {
                    $cond: {
                        if: {
                            $and: [
                                { $ne: ["$parsedDonationDate", null] },
                                { $gte: ["$parsedDonationDate", new Date("1970-01-01T00:00:00Z")] },
                                { $lte: ["$parsedDonationDate", new Date("9999-12-31T23:59:59Z")] }
                            ]
                        },
                        then: { $dateToString: { format: "%d %B %Y", date: "$parsedDonationDate" } },
                        else: "Invalid Date"
                    }
                }
            }
        });

        pipeline.push({
            $project: {
                parsedDonationDate: 0
            }
        });

        pipeline.push({
            $lookup: {
                from: "donorfollowups", 
                let: { donorPhone: "$phone" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$donorPhone", "$$donorPhone"] } } },
                    { $sort: { followupDate: -1, createdAt: -1 } },
                    { $limit: 1 },
                    {
                        $addFields: {
                            followupDate: {
                                $cond: {
                                    if: {
                                        $and: [
                                            { $ne: ["$followupDate", null] },
                                            { $lte: [{ $year: "$followupDate" }, 9999] },
                                            { $gte: [{ $year: "$followupDate" }, 0] }
                                        ]
                                    },
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

        pipeline.push({
            $addFields: {
                latestFollowUp: { $arrayElemAt: ["$latestFollowUpArr", 0] }
            }
        });

        pipeline.push({
            $project: {
                latestFollowUpArr: 0
            }
        });

        pipeline.push({ $sort: { name: 1 } });

        const donors = await TotalDonations.aggregate(pipeline);

        return NextResponse.json({ success: true, data: donors }, { status: 200 });

    } catch (error) {
        console.error("Donors Fetch Error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch donors" }, { status: 500 });
    }
}

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