import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const sendWhatsAppMessage = async (to, pdfUrl, name, transactionId, amount) => {
    try {
        const whatsappResponse = await axios.post('https://api.dovesoft.io/REST/directApi/message', {
            to,
            type: 'template',
            template: {
                language: {
                    policy: 'deterministic',
                    code: 'en'
                },
                name: 'webdonationrec',
                components: [
                    {
                        type: 'header',
                        parameters: [
                            {
                                type: 'document',
                                document: {
                                    link: pdfUrl,
                                    filename: `donation_receipt_${transactionId}.pdf`
                                }
                            }
                        ]
                    },
                    {
                        type: 'body',
                        parameters: [
                            {
                                type: 'text',
                                text: name
                            },
                            {
                                type: 'text',
                                text: transactionId
                            },
                            {
                                type: 'text',
                                text: 'Rs ' + amount
                            }
                        ]
                    }
                ]
            }
        }, {
            headers: {
                'wabaNumber': '918374047115',
                'Key': process.env.WHATSAPP_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        // Check if the response indicates success
        if (whatsappResponse.status === 200 && whatsappResponse.data?.messages?.[0]?.message_status === 'accepted') {
            console.log('WhatsApp message sent successfully:', whatsappResponse.data);
            return { success: true, data: whatsappResponse.data };
        } else {
            console.error('WhatsApp message failed:', whatsappResponse.data);
            return { success: false, error: whatsappResponse.data };
        }
    } catch (error) {
        console.error('Error sending WhatsApp message:', error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
};