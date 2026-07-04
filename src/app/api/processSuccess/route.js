import dbConnect from "@/app/lib/dbConnect";
import Donation from '@/models/Donation';
import TotalDonations from '@/models/TotalDonations';
import { generatePDF } from '../handleWebhook/pdfHelper';
import { uploadToS3 } from '../../../Helpers/awsHelper';
import { sendWhatsAppMessage } from '../handleWebhook/whatsappHelper';

export async function POST(req) {
  try {
    const { orderId } = await req.json();
    if (!orderId) return Response.json({ error: 'orderId required' }, { status: 400 });

    await dbConnect();
    const donation = await Donation.findOne({ orderId });
    if (!donation) return Response.json({ error: 'not found' }, { status: 404 });
    if (donation.messageSent) {
      await TotalDonations.findOneAndUpdate({ orderId }, { $set: { messageSent: true } });
      return Response.json({ ok: true, msg: 'already sent' }, { status: 200 });
    }

    // Perform heavy work
    const dict = donation.webhookData || { orderId, orderAmount: donation.amount, txStatus: donation.status };
    const pdfBuffer = await generatePDF(dict, donation);
    const orderIdClean = orderId.replace('order_', '');
    const pdfFileName = `donation_receipt_${orderIdClean}.pdf`;
    const pdfUrl = await uploadToS3(pdfBuffer, `TempleReceipts/${pdfFileName}`, "application/pdf");

    const messageResult = await sendWhatsAppMessage('91' + donation.phone, pdfUrl, donation.name, orderIdClean, donation.amount);

    if (messageResult?.success) {
      await Donation.findOneAndUpdate({ orderId }, { $set: { messageSent: true, needsProcessing: false } });
      await TotalDonations.findOneAndUpdate({ orderId }, { $set: { messageSent: true } });
      return Response.json({ ok: true }, { status: 200 });
    } else {
      // don't mark success; leave needsProcessing true so job can retry later
      await Donation.findOneAndUpdate({ orderId }, { $set: { needsProcessing: true } });
      return Response.json({ ok: false, error: messageResult?.error || 'whatsapp failed' }, { status: 200 });
    }
  } catch (err) {
    console.error('processSuccess error', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}