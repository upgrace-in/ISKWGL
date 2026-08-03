
import hmacSHA256 from 'crypto-js/hmac-sha256';
import { NextResponse } from "next/server";
import crypto from "crypto"; // Native Node.js module

// Your hashing function
function hmacDigest(msg, keyString) {
    const hmac = crypto.createHmac('sha256', keyString);
    hmac.update(msg);
    return hmac.digest('hex');
}

export async function POST(req) {
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

        let {amount} = await req.json();
    const paydata = {
        "addlParam1": "000",
        "addlParam2": "111",
        "aggregatorID": "100000000478571",
        "amount": amount.toString(),
        "currencyCode": "356",
        "customerEmailID": "diwakarbansal470@gmail.com",
        "customerMobileNo": "9571213124",
        "customerName": "Narayan",
        "merchantId": "100000000478572",
        "merchantTxnNo": generateRandomDigits(16),
        "payType": "0",
        "returnURL": "https://www.iskconwarangal.in/api/icici_return_url",
        "transactionType": "SALE",
        "txnDate": currentFormatted,
    }

    const msg = "addlParam1addlParam2aggregatorIDamountcurrencyCodecustomerEmailIDcustomerMobileNocustomerNamemerchantIdmerchantTxnNopayTypereturnURLtransactionTypetxnDate"

    const stringvalue = "000111100000000478571" + amount.toString() + "356diwakarbansal470@gmail.com9571213124Narayan100000000478572" + paydata.merchantTxnNo + "0https://www.iskconwarangal.in/api/icici_return_urlSALE" + paydata.txnDate

    // const hashvalue = hmacSHA256(stringvalue, 'db06cca0-838b-4e01-8b20-6ac446ffb6bd');
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

    // 4. Send the bank's response back to your frontend
    return NextResponse.json(data, { status: response.status });
    
    // Attempt to parse and print the response as JSON
    // console.log("Response : ", response);
}catch (error) {
        console.error("Error connecting to ICICI API:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" }, 
            { status: 500 }
        );
    }
}