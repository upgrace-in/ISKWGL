import dbConnect from "@/app/lib/dbConnect";
import Donation from '@/models/Donation'

export async function GET(request) {
    try {

        await dbConnect()

        const donationsWithDOBs = await Donation.find({
            dob: {
                $ne : null
            },
            status: {
                $eq: "SUCCESS"
            }
        }, { name: 1, dob: 1 })
            .catch((error) => { throw error })

        if (!donationsWithDOBs || donationsWithDOBs.length === 0) throw "No Birthday Found!!!"
        return Response.json({ data: donationsWithDOBs }, { status: 200 })

    } catch (error) {
        console.log(error)
        return Response.json({}, { status: 404 })
    }
}