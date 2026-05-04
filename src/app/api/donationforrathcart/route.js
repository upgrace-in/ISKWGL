import dbConnect from "@/app/lib/dbConnect";
import Donation from '@/models/Donation'

export async function GET() {
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

        // Let the Database do the math (Faster)
        const result = await Donation.aggregate([
            { 
                $match: { 
                    status: 'success', 
                    donatedFor: { $in: targetSevas } 
                } 
            },
            { 
                $group: { 
                    _id: null, 
                    totalAmount: { $sum: "$amount" } 
                } 
            }
        ]);

        const totalRaised = result.length > 0 ? result[0].totalAmount : 0;

        return Response.json({ totalRaised: totalRaised }, { status: 200 });

    } catch (error) {
        console.log(error)
        return Response.json({ data: "Something went wrong!"}, { status: 404 })
    }
}