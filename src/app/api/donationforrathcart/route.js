import dbConnect from "@/app/lib/dbConnect";
import Donation from '@/models/Donation'

export async function POST(request) {
    try {

        // const { password } = await request.json();

        // if (password !== process.env.ADMIN_PASSWORD)
        //     return Response.json({ data: "Invalid Password!" }, { status: 300 })

        await dbConnect()
        const targetSevas = [
            "New Rath 2026 - Jagannath Seva", 
            "New Rath 2026 - Baladev Seva", 
            "New Rath 2026 - Subhadra Seva", 
            "New Rath 2026 - Sudarshan Seva", 
            "New Rath 2026 - Prabhupad Seva",
            "New Rath 2026 - Full Rath Construction",
            "New Rath 2026 - Rath Cart Construction",
            "Prasadam Seva (10 devotees)"
        ];

        const donations = await Donation.find({
            status: 'success',
            donatedFor: { $in: targetSevas }
        });

        const totalRaised = donations.reduce((sum, item) => sum + item.amount, 0);

        return Response.json({ count: totalRaised }, { status: 200 })

    } catch (error) {
        console.log(error)
        return Response.json({ data: "Something went wrong!"}, { status: 404 })
    }
}