import dbConnect from "@/app/lib/dbConnect";
import Donation from '@/models/Donation';
import TotalDonations from '@/models/TotalDonations';

import { generatePDF } from './pdfHelper';
import { uploadToS3 } from '../../../Helpers/awsHelper';
import { sendWhatsAppMessage } from './whatsappHelper';

export async function GET(req) {
    return Response.json({ status: 'Webhook endpoint is active' }, { status: 200 });
}

export async function POST(req) {
    try {
        await dbConnect();

        let dict = {};
        let data = await req.text();
        data = data.split('&');

        for (const key in data) {
            let val = data[key].split('=');
            dict[val[0]] = decodeURIComponent(val[1]);
        }

        console.log('Order ID is :', dict?.orderId);
        const donation = await Donation.findOne({ orderId: dict?.orderId });
        if (!donation) throw "No Records Exists";

        // Update status immediately
        donation.amount = dict?.orderAmount;
        donation.status = dict?.txStatus;
        donation.webhookData = dict;
        donation.needsProcessing = dict?.txStatus === 'SUCCESS' ? true : false;
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

        await new_donation.save()

        // IMPORTANT: Return 200 OK to Cashfree immediately
        // This tells Cashfree the webhook was received
        const response = Response.json({ msg: true }, { status: 200 });

        // Optionally trigger the processor (best-effort — still add scheduled job)
        // Use absolute URL to ensure proper invocation
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

        return response;

    } catch (error) {
        console.log(error);
        return Response.json({ msg: error }, { status: 404 });
    }
}

// Process expensive operations in background
// async function processSuccessPayment(dict, donation) {
//     try {
//         const alreadySent = await Donation.findOne({ orderId: dict?.orderId, messageSent: true });
//         if (alreadySent) {
//             console.log('Message already sent, skipping...');
//             return;
//         }

//         const pdfBuffer = await generatePDF(dict, donation);
//         const orderId = dict.orderId.replace('order_', '');
//         const pdfFileName = `donation_receipt_${orderId}.pdf`;
//         const pdfUrl = await uploadToS3(pdfBuffer, `TempleReceipts/${pdfFileName}`, "application/pdf");

//         const messageResult = await sendWhatsAppMessage('91' + donation.phone, pdfUrl, donation.name, orderId, donation.amount);

//         if (messageResult?.success) {
//             await Donation.findOneAndUpdate(
//                 { orderId: dict?.orderId },
//                 { $set: { messageSent: true } },
//                 { new: true }
//             );
//         }
//     } catch (error) {
//         console.error('Error in processSuccessPayment:', error);
//     }
// }