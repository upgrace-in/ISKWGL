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

export async function POST(request) {

    try {

        await dbConnect()

        let { name, email, donationType, phone, address, pin, amount, pan, memoryOfSomeoneName, dob, redirectedFrom } = await request.json()

        if(dob){
            dob = Number(new Date(dob))
        }

        let orderId = `order_${Math.floor(Math.random() * 1000000)}`

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
                "memoryOfSomeoneName": memoryOfSomeoneName
            },

            "appId": clientID,
            "notifyUrl": `${process.env.NEXT_PUBLIC_DOMAIN}/api/handleWebhook`,
            "returnUrl": `${process.env.NEXT_PUBLIC_DOMAIN}/#donate`
        }

        const signature = generateSignature(formData);

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
            redirectedFrom,
            memoryOfSomeoneName
        })
        await dod.save()

        return Response.json({ ...formData, signature }, { status: 200 })

    } catch (error) {
        console.log(`Error while creating order: ${error}`)
        return Response.json({
            response: error
        }, { status: 404 })
    }

}