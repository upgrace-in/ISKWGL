import { NextResponse } from "next/server";
import crypto from "crypto"; 

// Helper function to verify the hash (crucial for security)
function hmacDigest(msg, keyString) {
    const hmac = crypto.createHmac('sha256', keyString);
    hmac.update(msg);
    return hmac.digest('hex');
}

// The bank sends a POST request to this URL
export async function POST(request) {
    try {
        // 1. Get the payload from the bank
        // Payment gateways usually send data as "application/x-www-form-urlencoded"
        const formData = await request.formData();
        
        // Convert FormData to a standard JavaScript object
        const responseData = {};
        for (const [key, value] of formData.entries()) {
            responseData[key] = value;
        }

        // Print to terminal so you can see exactly what the bank sent back!
        console.log("--- BANK RETURN PAYLOAD ---");
        console.log(responseData);

        // 2. Verify the Signature (CRITICAL)
        // You MUST verify that this request actually came from the bank and wasn't faked by a user.
        // Check ICICI docs for exactly which fields need to be hashed to verify the response.
        const SECRET_KEY = '6ab59c07-fa70-4a8a-ba8d-c8bd6943d113';
        
        // Example: Banks often send a field called 'secureHash' or 'signature'
        const bankHash = responseData.secureHash; 
        
        // Example: Re-create the string to hash based on ICICI's documentation for response formatting
        // const stringToVerify = `${responseData.merchantId}|${responseData.status}|${responseData.amount}`; 
        // const myCalculatedHash = hmacDigest(stringToVerify, SECRET_KEY);

        // if (bankHash !== myCalculatedHash) {
        //     console.error("HASH MISMATCH! Potential Fraud.");
        //     return NextResponse.redirect(new URL('/payment/failed?reason=security', request.url));
        // }

        // 3. Check the transaction status
        // The exact field name depends on ICICI (e.g., 'status', 'ResponseCode', 'txnStatus')
        // if (responseData.status === "SUCCESS") { // Replace "SUCCESS" with ICICI's success code
            
        //     // TODO: Update your database here (mark donation as PAID)

        //     // Redirect the user to your frontend Success page
        //     return NextResponse.redirect(new URL(`/payment/success?txnid=${responseData.merchantTxnNo}`, request.url));
        // } else {
        //     // Redirect the user to your frontend Failure page
        //     return NextResponse.redirect(new URL(`/payment/failed?txnid=${responseData.merchantTxnNo}`, request.url));
        // }
        
        return NextResponse.redirect(new URL('/rathyatra', request.url));
        // return NextResponse.redirect('https://www.iskconwarangal.in/rathyatra');

    } catch (error) {
        console.error("Error processing bank callback:", error);
        return NextResponse.redirect(new URL('/payment/error', request.url));
    }
}

// Just in case the bank uses a GET request redirect instead of POST
export async function GET(request) {
    const url = new URL(request.url);
    console.log("--- BANK RETURN QUERY PARAMS ---", url.searchParams.toString());
    
    // Handle similarly to POST, but extract data from searchParams
    return NextResponse.redirect(new URL('/payment/error', request.url)); 
}