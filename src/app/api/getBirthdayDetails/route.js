// import dbConnect from "@/app/lib/dbConnect";
// import Donation from '@/models/Donation'

// export async function GET(request) {
//     try {

//         await dbConnect()

//         const donationsWithDOBs = await Donation.find({
//             dob: {
//                 $ne : null
//             },
//             status: {
//                 $eq: "SUCCESS"
//             }
//         }, { name: 1, dob: 1 })
//             .catch((error) => { throw error })

//         if (!donationsWithDOBs || donationsWithDOBs.length === 0) throw "No Birthday Found!!!"
//         return Response.json({ data: donationsWithDOBs }, { status: 200 })

//     } catch (error) {
//         console.log(error)
//         return Response.json({}, { status: 404 })
//     }
// }

import dbConnect from "@/app/lib/dbConnect";
import Donation from '@/models/Donation';
import TotalDonations from '@/models/TotalDonations';

export async function GET(request) {
    try {
        await dbConnect();

        const today = new Date();
        const currentMonth = today.getMonth() + 1; // MongoDB $month is 1-indexed (1 = January)
        const currentDay = today.getDate();

        // Helper expression to safely convert timestamp to date and check month & day
        const birthdayMatchExpr = {
            $and: [
                {
                    $eq: [
                        {
                            $month: {
                                $convert: {
                                    input: "$dob",
                                    to: "date",
                                    onError: null,
                                    onNull: null
                                }
                            }
                        },
                        currentMonth
                    ]
                },
                {
                    $eq: [
                        {
                            $dayOfMonth: {
                                $convert: {
                                    input: "$dob",
                                    to: "date",
                                    onError: null,
                                    onNull: null
                                }
                            }
                        },
                        currentDay
                    ]
                }
            ]
        };

        // 1. Fetch from Donation model
        const donations = await Donation.find({
            status: "SUCCESS",
            phone: { $ne: null, $exists: true },
            $expr: birthdayMatchExpr
        }, { name: 1, phone: 1, dob: 1 }).lean();

        // 2. Fetch from TotalDonations model
        const totalDonationsList = await TotalDonations.find({
            phone: { $ne: null, $exists: true },
            $expr: birthdayMatchExpr
        }, { name: 1, phone: 1, dob: 1 }).lean();

        // 3. Combine both datasets
        const combinedData = [...donations, ...totalDonationsList];

        // 4. Deduplicate based on phone number
        const uniqueMap = new Map();
        for (const item of combinedData) {
            if (item.phone && !uniqueMap.has(item.phone)) {
                uniqueMap.set(item.phone, {
                    id: item._id,
                    name: item.name,
                    phone: item.phone,
                    dob: item.dob
                });
            }
        }

        const todayBirthdays = Array.from(uniqueMap.values());

        if (todayBirthdays.length === 0) {
            return Response.json({ message: "No Birthdays Today Found!!!" }, { status: 404 });
        }

        return Response.json({ data: todayBirthdays }, { status: 200 });

    } catch (error) {
        console.error("Error fetching birthdays:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}