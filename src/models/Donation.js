import mongoose, { Schema } from "mongoose";

const DonationSchema = new Schema({
    orderId: {
        type: String,
        required: true
    },
    donatedFor: {
        type: String
    },
    seva: {
        type: String,
        default: null
    },
    abhishekamTimeSlot: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    fulladdress: {
        addressLine1: { type: String, trim: true, default: '' },
        addressLine2: { type: String, trim: true, default: '' },
        pinCode: { type: String, trim: true, default: '' },
        city: { type: String, trim: true, default: '' },
        district: { type: String, trim: true, default: '' },
        state: { type: String, trim: true, default: '' },
        country: { type: String, trim: true, default: 'India' }
    },
    pin: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    pan: {
        type: String,
        default: null
    },
    dob: {
        type: Number,
        default: null
    },
    memoryOfSomeoneName: {
        type: String,
        default: null
    },
    status: {
        type: String,
        default: "PENDING"
    },
    signature: {
        type: String,
        required: true
    },
    redirectedFrom: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    messageSent: {
        type: Boolean,
        default: false
    },
    webhookData: {}
})

// return data should be Donation type thats why using as
const DonationModel = (mongoose.models.Donation) || mongoose.model("Donation", DonationSchema)

export default DonationModel