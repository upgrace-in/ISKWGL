import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
    orderId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    phone: { 
        type: String, 
        required: true, 
        trim: true, 
        match: [/^\d{10}$/, 'Phone number must be exactly 10 digits'] 
    },
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    dob: { 
        type: Date 
    },
    amount: { 
        type: Number, 
        required: true, 
        min: [1, 'Amount must be greater than zero'] 
    },
    donationDate: { 
        type: Date, 
        required: true 
    },
    seva: { 
        type: String, 
        required: true,
    },
    pan: { 
        type: String, 
        trim: true, 
        uppercase: true,
        default: null
    },
    address: {
        addressLine1: { type: String, trim: true, default: '' },
        addressLine2: { type: String, trim: true, default: '' },
        pinCode: { type: String, trim: true, default: '' },
        city: { type: String, trim: true, default: '' },
        district: { type: String, trim: true, default: '' },
        state: { type: String, trim: true, default: '' },
        country: { type: String, trim: true, default: 'India' }
    },
    messageSent: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Indexes to optimize your dashboard queries
donationSchema.index({ phone: 1 });
donationSchema.index({ createdAt: -1 });
donationSchema.index({ status: 1, createdAt: 1 });

export default mongoose.models.TotalDonations || mongoose.model('TotalDonations', donationSchema);