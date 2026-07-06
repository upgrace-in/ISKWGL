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