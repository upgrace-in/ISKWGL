import { generatePDF } from '../handleWebhook/pdfHelper';
import { uploadToS3 } from '../../../Helpers/awsHelper';
import { sendWhatsAppMessage } from '../handleWebhook/whatsappHelper';

export async function POST(req) {
    try {
        const body = await req.json();

    // Expected fields: phone, name, orderId (optional), amount, address, pan, webhookData (optional), date (optional)
    const { phone, name, orderId, amount, address, pan, webhookData, date, paymentMode, bank } = body || {};

        if (!phone) return Response.json({ error: 'phone is required' }, { status: 400 });

        // Build order id and dict similar to webhook handler
        const createdOrderId = orderId || `order_${Date.now()}`;
        const dict = {
            orderId: createdOrderId,
            orderAmount: amount || '0',
            // keep other fields if provided
            ...((webhookData && typeof webhookData === 'object') ? webhookData : {})
        };

        // Stateless flow: use request data only (no DB operations)
        // Determine transaction timestamp from input date (if provided) or now
        const txTimeRaw = date ? new Date(date) : new Date();
        const txTimeEncoded = encodeURIComponent(txTimeRaw.toISOString());

        const donation = {
            name: name || 'Donor',
            address: address || '',
            pan: pan || '',
            webhookData: webhookData || { paymentMode: paymentMode || 'Online', txTime: txTimeEncoded, referenceId: '' },
            amount: amount || '0',
            phone: phone
        };

        // If explicit paymentMode or bank passed, ensure webhookData contains them
        if (paymentMode) donation.webhookData.paymentMode = paymentMode;
        if (bank) donation.webhookData.bank = bank;

        // Generate PDF buffer
        const pdfBuffer = await generatePDF(dict, donation);

        const orderIdClean = createdOrderId.replace('order_', '');
        const pdfFileName = `donation_receipt_${orderIdClean}.pdf`;

        const pdfUrl = await uploadToS3(pdfBuffer, `TempleReceipts/${pdfFileName}`, "application/pdf");

        // Send WhatsApp message
        const normalizedPhone = phone.toString().replace(/[^0-9]/g, '').replace(/^0+/, '').replace(/^91/, '');
        const to = '91' + normalizedPhone;

    const messageResult = await sendWhatsAppMessage(to, pdfUrl, donation.name, orderIdClean, donation.amount);

        // No DB operations: do not store or update anything

    // Return the transaction date used (ISO string)
    return Response.json({ success: true, whatsapp: messageResult, pdfUrl, transactionDate: txTimeRaw.toISOString() }, { status: 200 });
    } catch (error) {
        console.error('Error in sendWhatsApp endpoint:', error);
        return Response.json({ success: false, error: error?.message || error }, { status: 500 });
    }
}
