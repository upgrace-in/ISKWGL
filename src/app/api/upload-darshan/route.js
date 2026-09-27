import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import sharp from 'sharp';

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
    return dbClient.db('Daily_Darshan'); // Using your existing database name
}

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('image');
        const caption = formData.get('caption') || 'Daily Darshan';

        if (!file) {
            return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 });
        }

        // Convert uploaded file into a buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // --- COMPRESSION PIPELINE USING SHARP ---
        // Resizes max width to 1200px (ideal for web displays), strips metadata, 
        // and converts to WebP format at 80% quality (visually lossless, tiny file size)
        const compressedBuffer = await sharp(buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

        // Convert the compressed image to a Base64 Data URL so it can be stored directly in MongoDB
        // (Alternatively, you can upload this buffer to Cloudinary/AWS S3 and save the URL)
        const base64Image = `data:image/webp;base64,${compressedBuffer.toString('base64')}`;

        const db = await getDatabase();
        const collection = db.collection('darshans');

        // Format today's date string (e.g., "27 September 2026")
        const todayDateStr = new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const photoItem = {
            url: base64Image,
            caption: caption
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
                mainImage: base64Image, // First photo becomes the cover card image
                photos: [photoItem],
                createdAt: new Date()
            });
        }

        return NextResponse.json({ status: 'success', message: 'Darshan compressed and saved to MongoDB!' });
    } catch (error) {
        console.error('Upload & compression error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}