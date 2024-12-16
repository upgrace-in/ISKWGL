import dbConnect from "@/app/lib/dbConnect";
import Donation from '@/models/Donation'

export async function POST(request) {
    try {

        // const { password } = await request.json();

        // if (password !== process.env.ADMIN_PASSWORD)
        //     return Response.json({ data: "Invalid Password!" }, { status: 300 })

        await dbConnect()

        const newDonation = await Donation.find({}).sort({ _id: -1 })

        return Response.json({ data: newDonation }, { status: 200 })

    } catch (error) {
        console.log(error)
        return Response.json({ data: "Something went wrong!" }, { status: 404 })
    }
}