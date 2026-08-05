import { NextResponse } from "next/server";
import crypto from "crypto"; 
import dbConnect from "@/app/lib/dbConnect";
import Donation from '@/models/Donation';
import TotalDonations from '@/models/TotalDonations';

function parseCompactTimestamp(rawTime) {
  if (!rawTime) return new Date();
  
  const str = String(rawTime);
  // Matches YYYYMMDDHHMMSS or YYYYMMDD
  const match = str.match(/^(\d{4})(\d{2})(\d{2})(?:(\d{2})(\d{2})(\d{2}))?$/);
  
  if (match) {
    const [, year, month, day, hours = 0, minutes = 0, seconds = 0] = match;
    // Month is 0-indexed in JS Date (0 = Jan, 7 = Aug)
    return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
  }
  
  const parsed = new Date(rawTime);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
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
        
        // Example: Banks often send a field called 'secureHash' or 'signature'
        const bankHash = responseData.secureHash;

        await dbConnect();

        const donation = await Donation.findOne({ orderId: responseData.addlParam1 });
        if (!donation) throw "No Records Exists";
        if (responseData.responseCode === '0000') {
            console.log("Payment successful for orderId:", responseData.addlParam1);
            const dict = {}
            dict.orderId = responseData.addlParam1;
            dict.orderAmount = responseData.amount;
            dict.txStatus = 'SUCCESS';
            dict.paymentMode = responseData.paymentMode;
            dict.referenceId = responseData.paymentID;
            dict.txTime = responseData.paymentDateTime;
            dict.formattedDate = parseCompactTimestamp(responseData.paymentDateTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            donation.webhookData = dict;
            donation.needsProcessing = true;
            donation.status = 'SUCCESS';
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

            try {
                fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/processSuccess`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: dict?.orderId }) // Include formentry flag to indicate it's from the form,
                    // don't await; it's best-effort; you can await if you want synchronous processing
                }).catch(err => console.warn('processor trigger failed', err));
            } catch (e) {
                console.warn('processor trigger exception', e);
            }
        }
        else{
            console.log("Payment failed for orderId:", responseData.addlParam1);
            donation.status = "FAILED";
            donation.needsProcessing = false;
            await donation.save();
        }
        


        
        return NextResponse.redirect(new URL('/', request.url), { status: 303 });
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