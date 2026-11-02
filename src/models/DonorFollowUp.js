import mongoose from 'mongoose';

const DonorNoteSchema = new mongoose.Schema({
    // donorId: { 
    //     type: mongoose.Schema.Types.ObjectId, 
    //     ref: 'TotalDonations', // or reference your donor identifier/phone
    //     required: true,
    //     index: true 
    // },
    donorPhone: { 
        type: String, 
        required: true,
        index: true 
    },
    text: { 
        type: String, 
        required: true, 
        trim: true 
    },
    author: { 
        type: String, 
        default: "Staff" 
    },
    followupDate: { 
        type: Date, 
        required: true,
        default: Date.now // fallback if not provided
    }
}, { timestamps: true }); // automatically adds createdAt and updatedAt

export default mongoose.models.DonorFollowUp || mongoose.model('DonorFollowUp', DonorNoteSchema);