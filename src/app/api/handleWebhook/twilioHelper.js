import { config } from './config';
import twilio from 'twilio';

const client = new twilio(config.twilio.accountSid, config.twilio.authToken);

export const sendMessage = async (to, body) => {
    try {
        const message = await client.messages.create({
            body,
            to,
            from: '+12515640560' // Your Twilio number
        });
        console.log('Message sent:', message.sid);
    } catch (error) {
        console.error('Error sending message:', error);
    }
};