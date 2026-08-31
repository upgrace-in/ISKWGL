import dbConnect from "@/app/lib/dbConnect";
import Donation from '@/models/Donation'; 
import TotalDonations from '@/models/TotalDonations'; 

function cleanDateString(dateObj) {
    return dateObj.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

export async function POST(req) {
    try {
        const { orderId } = await req.json();
        if (!orderId) return Response.json({ error: 'orderId required' }, { status: 400 });

        await dbConnect();
        const donation = await Donation.findOne({ orderId });
        if (!donation) {
            const totalDonations = await TotalDonations.findOne({ orderId });
            if (!totalDonations) {
                return Response.json({ error: 'not found' }, { status: 404 });
            }
            let new_donation = new Donation({
                orderId: totalDonations.orderId,
                donatedFor: totalDonations.seva,
                seva: totalDonations.seva,
                name: totalDonations.name,
                email: totalDonations.email || 'N/A',
                phone: totalDonations.phone,
                address: totalDonations.address.addressLine1 + ', ' + totalDonations.address.addressLine2 + ', ' + totalDonations.address.city + ', ' + totalDonations.address.state + ', ' + totalDonations.address.country + ' - ' + totalDonations.address.pinCode,
                fulladdress: totalDonations.address,
                pin: totalDonations.pin,
                amount: totalDonations.amount,
                pan: totalDonations.pan  || 'N/A',
                dob: totalDonations.dob || 0,
                createdAt: totalDonations.donationDate,
                signature: '-',
                status: 'SUCCESS',
            });
            const dict = {}
            dict.orderId = totalDonations.orderId;
            dict.orderAmount = totalDonations.amount;
            dict.txStatus = 'SUCCESS';
            dict.paymentMode = totalDonations.source;
            dict.referenceId = '-';
            dict.formattedDate = cleanDateString(totalDonations.donationDate);
            // dict.formattedDate = parseCompactTimestamp(totalDonations.donationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            new_donation.webhookData = dict;
            new_donation.needsProcessing = true;
            await new_donation.save();
        }
        else {
            donation.needsProcessing = true;
            await donation.save();
        }

        // Ensure the enclosing function is async (e.g., async function handler() { ... })
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/processSuccess`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: orderId }),
            });

            const data = await response.json(); // Parses { ok: true }
            
            // Return the JSON response in your desired format
            return Response.json(data, { status: response.status });
        } catch (e) {
            console.warn('processor trigger exception', e);
            return Response.json({ ok: false, error: e.message }, { status: 500 });
        }
    } catch (err) {
        console.error('sendwhatsappmessagefromdashboard error', err);
        return Response.json({ error: String(err) }, { status: 500 });
    }
}