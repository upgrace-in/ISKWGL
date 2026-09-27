import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'darshans.json');

// 1. Handles the GET request from your React frontend
export async function GET(request) {
    try {
        if (!fs.existsSync(dbPath)) {
            return NextResponse.json([]);
        }
        const fileData = fs.readFileSync(dbPath, 'utf8');
        return NextResponse.json(JSON.parse(fileData));
    } catch (error) {
        return NextResponse.json({ error: 'Failed to load darshans' }, { status: 500 });
    }
}

// 2. Handles the POST request from Dove Soft WhatsApp webhook
export async function POST(request) {
    try {
        const body = await request.json();
        const { imageUrl, caption } = body;

        if (!imageUrl) {
            return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
        }

        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        let darshans = [];
        if (fs.existsSync(dbPath)) {
            darshans = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        }

        const todayDateStr = new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        let todayEntry = darshans.find(d => d.date === todayDateStr);
        const photoItem = { url: imageUrl, caption: caption || 'Daily Darshan' };

        if (todayEntry) {
            todayEntry.photos.push(photoItem);
        } else {
            darshans.unshift({
                date: todayDateStr,
                mainImage: imageUrl,
                photos: [photoItem]
            });
        }

        fs.writeFileSync(dbPath, JSON.stringify(darshans, null, 2));
        return NextResponse.json({ status: 'success' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
