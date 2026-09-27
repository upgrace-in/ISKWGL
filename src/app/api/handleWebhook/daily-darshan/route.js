import fs from 'fs';
import path from 'path';

// Helper path to store darshan records locally (or replace with a real database like MongoDB/PostgreSQL)
const dbPath = path.join(process.cwd(), 'data', 'darshans.json');

// Ensure data directory exists
const ensureDirectoryExists = () => {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

export default async function handler(req, res) {
    const todayDateStr = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }); // e.g., "27 September 2026"

    // ----------------------------------------------------
    // 1. HANDLE GET REQUEST (Frontend fetches darshans)
    // ----------------------------------------------------
    if (req.method === 'GET') {
        try {
            if (!fs.existsSync(dbPath)) {
                return res.status(200).json([]);
            }
            const fileData = fs.readFileSync(dbPath, 'utf8');
            const darshans = JSON.parse(fileData);
            return res.status(200).json(darshans);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to load darshans' });
        }
    }

    // ----------------------------------------------------
    // 2. HANDLE POST REQUEST (Webhook from Dove Soft / WhatsApp)
    // ----------------------------------------------------
    if (req.method === 'POST') {
        try {
            const { imageUrl, caption, senderPhone } = req.body; 

            // Optional security: Check if the sender is an authorized priest/admin number
            // const allowedNumbers = ["+919876543210"];
            // if (senderPhone && !allowedNumbers.includes(senderPhone)) {
            //     return res.status(403).json({ error: "Unauthorized sender" });
            // }

            if (!imageUrl) {
                return res.status(400).json({ error: 'No image URL provided in payload' });
            }

            const allowedNumbers = ["+919571213124"]; // Priest/Admin numbers
            if (!allowedNumbers.includes(incomingSenderNumber)) {
                return res.status(403).json({ error: "Unauthorized sender" });
            }

            ensureDirectoryExists();

            let darshans = [];
            if (fs.existsSync(dbPath)) {
                darshans = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            }

            // Check if an entry for TODAY already exists in our records
            let todayEntry = darshans.find(d => d.date === todayDateStr);

            const photoItem = {
                url: imageUrl,
                caption: caption || 'Daily Darshan'
            };

            if (todayEntry) {
                // If today's card already exists, append this new photo to its array (e.g. evening aarti)
                todayEntry.photos.push(photoItem);
            } else {
                // If this is the first photo of the day, create a new card entry
                const newDayEntry = {
                    date: todayDateStr,
                    mainImage: imageUrl, // The first photo becomes the cover card image
                    photos: [photoItem]
                };
                darshans.unshift(newDayEntry); // Add to the front of the list
            }

            // Save back to storage
            fs.writeFileSync(dbPath, JSON.stringify(darshans, null, 2));

            return res.status(200).json({ status: 'success', message: 'Darshan added successfully' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // Handle any other HTTP methods
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}