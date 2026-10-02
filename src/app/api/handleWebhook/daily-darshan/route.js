import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

if (!uri) {
    throw new Error('Please add your Mongo URI to .env.local');
}

// In Next.js, use a global variable so the connection is cached across requests
if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    client = new MongoClient(uri);
    clientPromise = client.connect();
}

async function getDatabase() {
    const dbClient = await clientPromise;
    return dbClient.db('Daily_Darshan'); // You can name your database whatever you like
}

// ----------------------------------------------------
// 1. HANDLE GET REQUEST (Frontend fetches darshans)
// ----------------------------------------------------
export async function GET(request) {
    try {
        const db = await getDatabase();
        // Fetch all darshans from MongoDB, sorted by date in descending order (newest first)
        const darshans = await db.collection('darshans')
            .find({})
            .sort({ _id: -1 })
            .toArray();

        return NextResponse.json(darshans);
    } catch (error) {
        console.error('Database fetch error:', error);
        return NextResponse.json({ error: 'Failed to load darshans' }, { status: 500 });
    }
}

// ----------------------------------------------------
// 2. HANDLE POST REQUEST (Webhook from Dove Soft / WhatsApp)
// ----------------------------------------------------
export async function POST(request) {
    try {
        const body = await request.json();
        const { imageUrl, caption } = body;

        if (!imageUrl) {
            return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
        }

        const db = await getDatabase();
        const collection = db.collection('darshans');

        // Format today's date string (e.g., "27 September 2026")
        const todayDateStr = new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const photoItem = {
            url: imageUrl,
            caption: caption || 'Daily Darshan'
        };

        // Check if an entry for TODAY already exists in MongoDB
        const existingDay = await collection.findOne({ date: todayDateStr });

        if (existingDay) {
            // If today's card exists, push the new photo into its photos array
            await collection.updateOne(
                { date: todayDateStr },
                { $push: { photos: photoItem } }
            );
        } else {
            // If it's the first photo of the day, create a brand new date card document
            await collection.insertOne({
                date: todayDateStr,
                mainImage: imageUrl, // First photo becomes the cover card image
                photos: [photoItem],
                createdAt: new Date()
            });
        }

        return NextResponse.json({ status: 'success', message: 'Darshan saved to MongoDB' });
    } catch (error) {
        console.error('Webhook save error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}