import dbConnect from "@/app/lib/dbConnect";
import Donation from '@/models/Donation';
import { sendMessage } from './twilioHelper';
import { generatePDF } from './pdfHelper';
import { uploadToS3 } from '../../../Helpers/awsHelper';
import { sendWhatsAppMessage } from './whatsappHelper';

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

        console.log('Transaction Status:', dict?.txStatus);

        donation.amount = dict?.orderAmount;
        donation.status = dict?.txStatus;
        donation.webhookData = dict;
        //console.log('Webhook data', donation.webhookData);
        await donation.save();

        if (dict?.txStatus === 'SUCCESS') {
            const alreadySent = await Donation.findOne({ orderId: dict?.orderId, messageSent: true });
            if (alreadySent) {
                console.log('Message already sent, skipping...');
                return Response.json({ msg: 'Already sent' }, { status: 200 });
            }
        
            const pdfBuffer = await generatePDF(dict, donation);
            console.log('PDF generated successfully');
        
            const orderId = dict.orderId.replace('order_', '');
            const pdfFileName = `donation_receipt_${orderId}.pdf`;
        
            const pdfUrl = await uploadToS3(pdfBuffer, `TempleReceipts/${pdfFileName}`);
            console.log('PDF uploaded to S3:', pdfUrl);
        
            // Send message
            const messageResult = await sendWhatsAppMessage('91' + donation.phone, pdfUrl, donation.name, orderId, donation.amount);
            
            if (messageResult?.success) {
                // Update only after message is sent successfully
                await Donation.findOneAndUpdate(
                    { orderId: dict?.orderId },
                    { $set: { messageSent: true } },
                    { new: true }
                );
            } else {
                console.warn('Message not sent. Keeping messageSent as false.');
            }
        }        

        return Response.json({ msg: true }, { status: 200 });
    } catch (error) {
        console.log(error);
        return Response.json({ msg: error }, { status: 404 });
    }
}