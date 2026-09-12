// import { Cashfree } from "cashfree-pg";
import crypto from 'node:crypto'
import dbConnect from '@/app/lib/dbConnect';
import Donation from '@/models/Donation';

const clientID = process.env.NEXT_PUBLIC_GATEWAY_TYPE === '1' ? process.env.CASHFREE_TEST_ID : process.env.CASHFREE_ID;
const clientSECRET = process.env.NEXT_PUBLIC_GATEWAY_TYPE === '1' ? process.env.CASHFREE_TEST_SECRET : process.env.CASHFREE_SECRET;
// const environment = process.env.NEXT_PUBLIC_GATEWAY_TYPE === '1' ? Cashfree.Environment.SANDBOX : Cashfree.Environment.PRODUCTION

function generateSignature(postData) {
    const secretKey = clientSECRET;
    const signatureData = Object.keys(postData).sort().map(key => key + postData[key]).join('');
    const signature = crypto.createHmac('sha256', secretKey).update(signatureData).digest('base64');
    return signature;
}

// Helper function to generate a unique orderId
async function generateUniqueOrderId() {
    let orderId;
    let isUnique = false;

    while (!isUnique) {
        // Generate orderId (e.g., order_1710000000000_1234)
        orderId = `order_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

        // Check if the orderId already exists in MongoDB
        const existingDonation = await Donation.findOne({ orderId }).lean();
        
        if (!existingDonation) {
            isUnique = true; // Unique ID found, exit loop
        }
    }

    return orderId;
}

export async function POST(request) {

    try {

        // console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);

        await dbConnect();

        let { name, email, donationType,seva, phone, address,fulladdress, pin, amount, pan, memoryOfSomeoneName, abhishekamTimeSlot, dob, redirectedFrom } = await request.json()

        if(dob){
            dob = Number(new Date(dob))
        }

        // console.log("Abhishekam Timeslot: ", abhishekamTimeSlot);
        // 1. Generate guaranteed unique order ID
        const orderId = await generateUniqueOrderId();

        let formData = {
            "customerName": name,
            "customerEmail": email,
            "customerPhone": phone,

            "orderId": orderId,
            "orderAmount": parseFloat(amount),
            "orderNote": "Pay to ISKCON",
            "orderCurrency": "INR",
            "orderTags": {
                "address": address,
                "pin": pin,
                "pan": pan,
                "dob": dob,
                "memoryOfSomeoneName": memoryOfSomeoneName,
                "abhishekTimeSlot": abhishekamTimeSlot,
            },

            "appId": clientID,
            "notifyUrl": `${process.env.NEXT_PUBLIC_DOMAIN}/api/handleWebhook`,
            "returnUrl": `${process.env.NEXT_PUBLIC_DOMAIN}`
        }

        const signature = generateSignature(formData);
        console.log("fulladdress : ",fulladdress);

        let dod = new Donation({
            orderId,
            name,
            email,
            pin,
            pan,
            dob,
            amount,
            signature,
            address,
            phone,
            donatedFor: donationType,
            seva,
            fulladdress,
            redirectedFrom,
            memoryOfSomeoneName,
            abhishekamTimeSlot,
        })

        await dod.save()
        console.log("New Donation object:", dod);
        console.log("createDonation response:", { ...formData, signature });

        return Response.json({ ...formData, signature }, { status: 200 })

    } catch (error) {
        console.log(`Error while creating order: ${error}`)
        return Response.json({
            error: error.message || "Failed to create order"
        }, { status: 500 })
    }

}