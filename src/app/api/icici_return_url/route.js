import { NextResponse } from "next/server";
import crypto from "crypto"; 
import dbConnect from "@/app/lib/dbConnect";
import Donation from '@/models/Donation';
import TotalDonations from '@/models/TotalDonations';

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
        
        // Example: Banks often send a field called 'secureHash' or 'signature'
        const bankHash = responseData.secureHash;

        await dbConnect();

        const donation = await Donation.findOne({ orderId: responseData.addlParam1 });
        if (!donation) throw "No Records Exists";
        donation.status = responseData.respDescription === "Transaction successful" ? "Success" : "Failed";
        await donation.save();

        let new_donation = new TotalDonations({
            orderId: donation.orderId,
            phone: donation.phone,
            name: donation.name,
            email: donation.email || null,
            amount: donation.amount,
            source: "Website",
            donationDate: new Date(),
            seva: donation.seva,
            pan: donation.pan,
            address: donation.fulladdress,
            messageSent: false,
            dob: donation.dob
        })

        await new_donation.save();


        
        return NextResponse.redirect(new URL('/', request.url));
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