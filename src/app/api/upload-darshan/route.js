import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { handleUpload } from '@vercel/blob/client';
import { withApiLogging } from '@/app/lib/apiLogger';

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
export const GET = withApiLogging(async function (request) {
    try {
        const { searchParams } = new URL(request.url);
        const targetDate = searchParams.get('date');
        const db = await getDatabase();
        const collection = db.collection('darshans');

        // CASE 1: Fetch full photos for a single specific date when clicked
        if (targetDate) {
            const darshan = await collection.findOne({ date: targetDate });
            if (!darshan) {
                return NextResponse.json({ error: 'Darshan not found' }, { status: 404 });
            }

            const formattedDarshan = {
                ...darshan,
                _id: darshan._id.toString(),
                photos: darshan.photos?.map(photo => ({
                    ...photo,
                    ...(photo._id && { _id: photo._id.toString() })
                })) || []
            };

            return NextResponse.json(formattedDarshan);
        } 

        // CASE 2: Fetch lightweight summary (Date & Main Image only) for the latest 15 dates
        const rawSummaries = await collection
            .find({}, { projection: { date: 1, mainImage: 1, createdAt: 1 } })
            .sort({ _id: -1 })
            .limit(15)
            .toArray();

        const summaries = rawSummaries.map(item => ({
            _id: item._id.toString(),
            date: item.date,
            mainImage: item.mainImage
        }));

        return NextResponse.json(summaries);

    } catch (error) {
        console.error('Database fetch error:', error);
        return NextResponse.json({ error: 'Failed to load darshans' }, { status: 500 });
    }
});

// ----------------------------------------------------
// POST: Handle Client Upload Authorization & MongoDB Saving
// ----------------------------------------------------
export const POST = withApiLogging(async function (request) {
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
});
