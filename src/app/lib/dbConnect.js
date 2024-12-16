import mongoose from "mongoose";

const connection = {};

// void means we don't care whats coming back its not the same like c++ and others
async function dbConnect() {
    if (connection.isConnected) {
        console.log("Already connected to database");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "");

        connection.isConnected = db.connections[0].readyState;

        console.log("DB Connected Succesfully !!!");
    } catch (e) {
        console.log("Database connection failed", e);

        process.exit(1);
    }
}

export default dbConnect;
