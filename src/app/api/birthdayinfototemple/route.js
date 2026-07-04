import { sendWhatsAppMessageforBirthdayInfotoTemple } from '../handleWebhook/whatsappHelper';

export async function POST(req) {
    try {
        const Birthdaylist = await req.json();
        console.log('Received Birthdaylist:', Birthdaylist);

    // Expected fields: phone, name, orderId (optional), amount, address, pan, webhookData (optional), date (optional)
    // const { Birthdaylist } = body || {};

        // if (!phone) return Response.json({ error: 'phone is required' }, { status: 400 });

        // Send WhatsApp message
        // const normalizedPhone = phone.toString().replace(/[^0-9]/g, '').replace(/^0+/, '').replace(/^91/, '');
        // const to = '91' + normalizedPhone;

    const messageResult = await sendWhatsAppMessageforBirthdayInfotoTemple(Birthdaylist);

        // No DB operations: do not store or update anything

    // Return the transaction date used (ISO string)
    return Response.json({ success: true, whatsapp: messageResult }, { status: 200 });
    } catch (error) {
        console.error('Error in sendWhatsApp endpoint:', error);
        return Response.json({ success: false, error: error?.message || error }, { status: 500 });
    }
}
