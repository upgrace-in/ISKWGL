import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { put } from '@vercel/blob';
import sharp from 'sharp';
import { randomBytes } from 'crypto';

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
// 1. GET: Frontend fetches all darshans for the gallery
// ----------------------------------------------------
export async function GET(request) {
    try {
        const db = await getDatabase();
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
// 2. POST: Admin uploads photo (Compress -> Blob -> MongoDB)
// ----------------------------------------------------
export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('image');
        const caption = formData.get('caption') || 'Daily Darshan';

        if (!file) {
            return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // --- COMPRESS & CONVERT TO WEBP ---
        const compressedBuffer = await sharp(buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

        // --- GENERATE SECURE UNGUESSABLE FILENAME ---
        const secureHash = randomBytes(8).toString('hex');
        const fileName = `darshan-${Date.now()}-${secureHash}.webp`;

        // --- UPLOAD TO VERCEL BLOB ---
        const blob = await put(fileName, compressedBuffer, {
            access: 'public',
            contentType: 'image/webp',
        });

        const imageUrl = blob.url;

        // --- SAVE TO MONGODB ---
        const db = await getDatabase();
        const collection = db.collection('darshans');

        const todayDateStr = new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const photoItem = {
            url: imageUrl,
            caption: caption
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
                mainImage: imageUrl,
                photos: [photoItem],
                createdAt: new Date()
            });
        }

        return NextResponse.json({ status: 'success', message: 'Darshan uploaded successfully!' });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}