import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null,
    };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
        });
    }

    try {
        cached.conn = await cached.promise;

        console.log(
            "Database connected:",
            cached.conn.connection.readyState
        );

        return cached.conn;
    } catch (error) {
        cached.promise = null;

        console.error("Database connection error:", error);

        throw error;
    }
}

export default dbConnect;