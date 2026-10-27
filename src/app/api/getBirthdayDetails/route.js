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
import TotalDonations from '@/models/TotalDonations'; // Make sure this path/filename matches your model file

export async function GET(request) {
    try {
        await dbConnect();

        // 1. Fetch from Donation model (SUCCESS status + valid DOB & mobile)
        const donations = await Donation.find({
            dob: { $ne: null },
            status: { $eq: "SUCCESS" },
            mobile: { $ne: null, $exists: true }
        }, { name: 1, mobile: 1, dob: 1 }).lean();

        // 2. Fetch from TotalDonations model (adjust filters as needed)
        const totalDonationsList = await TotalDonations.find({
            dob: { $ne: null },
            mobile: { $ne: null, $exists: true }
        }, { name: 1, mobile: 1, dob: 1 }).lean();

        // 3. Combine both datasets into a single array
        const combinedData = [...donations, ...totalDonationsList];

        // 4. Deduplicate based on mobile number using a Map
        const uniqueMap = new Map();
        for (const item of combinedData) {
            if (item.mobile && !uniqueMap.has(item.mobile)) {
                uniqueMap.set(item.mobile, {
                    id: item._id,
                    name: item.name,
                    mobile: item.mobile,
                    dob: item.dob
                });
            }
        }

        const uniqueDonors = Array.from(uniqueMap.values());

        if (uniqueDonors.length === 0) {
            return Response.json({ message: "No Birthday Found!!!" }, { status: 404 });
        }

        return Response.json({ data: uniqueDonors }, { status: 200 });

    } catch (error) {
        console.error("Error fetching birthdays:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}