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
                name: 'donatereceipt3',
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
                'Key': '5b178ced68XX',
                'Content-Type': 'application/json'
            }
        });
        console.log('WhatsApp message sent:', whatsappResponse.data);
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
    }
};