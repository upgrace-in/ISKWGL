import mongoose from 'mongoose';

const connection = {};

async function dbConnect() {
    if (connection.isConnected) {
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        connection.isConnected = db.connections[0].readyState;
        console.log('Database connected:', connection.isConnected);
    } catch (error) {
        console.error('Database connection error:', error);
        throw new Error('Database connection failed');
    }
}

export default dbConnect;