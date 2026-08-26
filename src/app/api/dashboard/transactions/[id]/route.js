import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import TotalDonations from '@/models/TotalDonations';

export async function DELETE(request, { params }) {
    const { id } = params; // This is the orderId

    if (!id) {
        return NextResponse.json({ success: false, message: 'Order ID is required' }, { status: 400 });
    }

    try {
        await dbConnect();

        const deletedTransaction = await TotalDonations.findOneAndDelete({ orderId: id });

        if (!deletedTransaction) {
            return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return NextResponse.json({ success: false, message: 'Server error while deleting transaction.' }, { status: 500 });
    }
}
export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        const body = await request.json();
        const { name, orderId, donationDate, seva, amount, source } = body;

        const updatedDonation = await TotalDonations.findByIdAndUpdate(
            id,
            {
                $set: {
                    name,
                    orderId,
                    donationDate: donationDate ? new Date(donationDate) : undefined,
                    seva,
                    amount: Number(amount),
                    source
                }
            },
            { new: true }
        );

        if (!updatedDonation) {
            return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, donation: updatedDonation });
    } catch (error) {
        console.error("Transaction Update Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}