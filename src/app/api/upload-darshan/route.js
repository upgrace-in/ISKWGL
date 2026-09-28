import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { handleUpload } from '@vercel/blob/client';

const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

if (!uri) {
    throw new Error('Please add your Mongo URI to .env.local');
}

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
    return dbClient.db('Daily_Darshan');
}

// ----------------------------------------------------
// GET: Fetch all darshans
// ----------------------------------------------------
export async function GET(request) {
    try {
        const db = await getDatabase();
        const rawDarshans = await db.collection('darshans')
            .find({})
            .sort({ _id: -1 })
            .toArray();

        const darshans = rawDarshans.map(darshan => ({
            ...darshan,
            _id: darshan._id.toString(),
            photos: darshan.photos?.map(photo => ({
                ...photo,
                ...(photo._id && { _id: photo._id.toString() })
            })) || []
        }));

        return NextResponse.json(darshans);
    } catch (error) {
        console.error('Database fetch error:', error);
        return NextResponse.json({ error: 'Failed to load darshans' }, { status: 500 });
    }
}

// ----------------------------------------------------
// POST: Handle Client Upload Authorization & MongoDB Saving
// ----------------------------------------------------
export async function POST(request) {
    const body = await request.json();

    try {
        // If it's a Vercel Blob client upload handshake
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname) => {
                return {
                    allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
                    addRandomSuffix: true,
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // This triggers automatically on Vercel once an image is successfully uploaded
                try {
                    const db = await getDatabase();
                    const collection = db.collection('darshans');

                    const todayDateStr = new Date().toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });

                    // You can pass custom caption via client payload if needed, or default it
                    const photoItem = {
                        url: blob.url,
                        caption: 'Daily Darshan'
                    };

                    const existingDay = await collection.findOne({ date: todayDateStr });

                    if (existingDay) {
                        await collection.updateOne(
                            { date: todayDateStr },
                            { $push: { photos: photoItem } }
                        );
                    } else {
                        await collection.insertOne({
                            date: todayDateStr,
                            mainImage: blob.url,
                            photos: [photoItem],
                            createdAt: new Date()
                        });
                    }
                } catch (dbError) {
                    console.error('Failed to update MongoDB after blob upload:', dbError);
                }
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
