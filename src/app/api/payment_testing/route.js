
import hmacSHA256 from 'crypto-js/hmac-sha256';
import { NextResponse } from "next/server";
import crypto from "crypto"; // Native Node.js module
import { withApiLogging } from '@/app/lib/apiLogger';
import { randomUUID } from 'crypto';

// Your hashing function
function hmacDigest(msg, keyString) {
    const hmac = crypto.createHmac('sha256', keyString);
    hmac.update(msg);
    return hmac.digest('hex');
}

// Helper function to generate a unique orderId
// async function generateUniqueOrderId() {
//     let orderId;
//     let isUnique = false;

//     while (!isUnique) {
//         // Generate orderId (e.g., order_1710000000000_1234)
//         orderId = `order_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}_${Math.floor(1000 + Math.random() * 9000)}`

//         // Check if the orderId already exists in MongoDB
//         const existingDonation = await Donation.findOne({ orderId }).lean();
        
//         if (!existingDonation) {
//             isUnique = true; // Unique ID found, exit loop
//         }
//     }

//     return orderId;
// }
function generateUniqueOrderId() {
    // Generates a clean, highly unique order ID instantly without a database lookup
    const dateStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    const uniqueSuffix = randomUUID().slice(0, 8);
    return `ORD_${dateStr}_${uniqueSuffix}`;
}

export const POST = withApiLogging(async function (req) {
    const crypto = require('crypto');
    function generateRandomDigits(length = 16) {
        let result = (Math.floor(Math.random() * 9) + 1).toString(); // Ensure non-zero start
        while (result.length < length) {
            const randomByte = crypto.randomBytes(1)[0] % 10;
            result += randomByte.toString();
        }
        return result;
    }
    try{
        const date = new Date();

        const currentFormatted = date.getFullYear().toString() +
        String(date.getMonth() + 1).padStart(2, '0') +
        String(date.getDate()).padStart(2, '0') +
        String(date.getHours()).padStart(2, '0') +
        String(date.getMinutes()).padStart(2, '0') +
        String(date.getSeconds()).padStart(2, '0');

        let {amount, name, phone, email} = await req.json();
        const orderId = await generateUniqueOrderId();
        // const hashvalue = hmacSHA256(stringvalue, 'db06cca0-838b-4e01-8b20-6ac446ffb6bd');
        const paydata = {
            "addlParam1": orderId,
            "addlParam2": "111",
            "aggregatorID": "100000000478571",
            "amount": amount.toString(),
            "currencyCode": "356",
            "customerEmailID": email,
            "customerMobileNo": phone,
            "customerName": name,
            "merchantId": "100000000478572",
            "merchantTxnNo": generateRandomDigits(16),
            "payType": "0",
            "returnURL": "https://www.iskconwarangal.in/api/icici_return_url",
            "transactionType": "SALE",
            "txnDate": currentFormatted,
        }

        const msg = "addlParam1addlParam2aggregatorIDamountcurrencyCodecustomerEmailIDcustomerMobileNocustomerNamemerchantIdmerchantTxnNopayTypereturnURLtransactionTypetxnDate"

        const stringvalue = orderId + "111" + "100000000478571" + amount.toString() + "356"+email+phone+name+"100000000478572" + paydata.merchantTxnNo + "0https://www.iskconwarangal.in/api/icici_return_urlSALE" + paydata.txnDate

        const hashvalue = hmacDigest(stringvalue, '6ab59c07-fa70-4a8a-ba8d-c8bd6943d113');
        console.log("Hash Value:", hashvalue);
        

        paydata["secureHash"] = hashvalue

        const url = "https://pgpay.icicibank.com/pg/api/v2/initiateSale"
        const headers = {
            'Content-Type': 'application/json'
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(paydata)
        })
        const data = await response.json();
        console.log("\n--- 4. RESPONSE FROM ICICI BANK ---");
        console.log("Status Code:", response.status);
        console.log(data);

        // adding orderId for returning
        const Updated_data = {
            ...data,
            orderId: orderId
        }

        // 4. Send the bank's response back to your frontend
        return NextResponse.json(Updated_data, { status: response.status });
        
        // Attempt to parse and print the response as JSON
        // console.log("Response : ", response);
    }
    catch (error) {
        console.error("Error connecting to ICICI API:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" }, 
            { status: 500 }
        );
    }
});