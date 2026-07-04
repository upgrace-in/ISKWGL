import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect"; // Adjust path to your dbConnect/mongodb file
import TotalDonations from "@/models/TotalDonations";     // Adjust path to your Mongoose TotalDonations model

export async function POST(request) {
    try {
        // 1. Connect to MongoDB
        await dbConnect();

        // 2. Parse the incoming JSON payload from the frontend form
        const body = await request.json();
        const { 
            phone, name, dob, amount, seva, pan, donationDate,
            addressLine1, addressLine2, pinCode, state, district, city, country 
        } = body;

        // 3. Basic backend validation for required fields
        if (!phone || !amount || !seva || !state || !city || !donationDate) {
            return NextResponse.json(
                { success: false, message: "Missing required fields (phone, amount, seva, state, city, donationDate)." },
                { status: 400 }
            );
        }

        let isUnique = false;
        let orderId = "";

        while (!isUnique) {
            // 1. Generate a random ID
            orderId = `order_${Math.floor(Math.random() * 1000000)}`;
            
            // 2. Check the database to see if it already exists
            const existingDonation = await TotalDonations.findOne({ orderId: orderId });
            
            // 3. If nothing is found, it's unique! Exit the loop.
            if (!existingDonation) {
                isUnique = true;
            }
            // If it DOES exist, the loop repeats and generates a new one.
        }

        // 4. Create and save the new donation record in the database
        const newDonation = new TotalDonations({
            orderId,
            phone,
            name,
            dob: dob ? new Date(dob) : null,
            amount: Number(amount),
            seva,
            pan: pan ? pan.toUpperCase() : null,
            address: {
                addressLine1,
                addressLine2,
                pinCode,
                state,
                district,
                city,
                country: country || "India"
            },
            donationDate: new Date(donationDate),
            messageSent: false,
            createdAt: new Date()
        });

        await newDonation.save();

        // 5. Respond back with success
        return NextResponse.json({ 
            success: true, 
            message: "Contribution saved successfully", 
            data: newDonation 
        }, { status: 201 });

    } catch (error) {
        console.error("Error saving contribution:", error);
        return NextResponse.json(
            { success: false, message: "Database server error while saving entry." },
            { status: 500 }
        );
    }
}