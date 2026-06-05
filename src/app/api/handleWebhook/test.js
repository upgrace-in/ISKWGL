import fs from 'fs';
import { generatePDF } from './pdfHelper.js'; // adjust path

const dict = {
    orderId: 'order_49596',
    orderAmount: '100'
};

const donation = {
    name: 'DIWAKAR BANSAL',
    address: 'Prashanth Nagar, Hanamkonda, Warangal (506004)',
    pin: '500085',
    pan: 'FRCPB2006P',
    phone: '9571213124',
    email: 'bansaldiwakar108@gmail.com',
    donatedFor: 'General Donation Amount of your Choice',
    webhookData: {
        txTime: new Date().toISOString(),
        paymentMode: 'UPI',
        referenceId: '5356188674'
    }
};

(async () => {
    try {
        const pdfBuffer = await generatePDF(dict, donation);

        fs.writeFileSync('test-receipt.pdf', pdfBuffer);

        console.log('PDF generated successfully');
    } catch (err) {
        console.error(err);
    }
})();