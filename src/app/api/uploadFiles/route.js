import { uploadToS3 } from '@/Helpers/awsHelper';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file'); // The file to upload
        const path = formData.get('path'); // The path in the S3 bucket

        if (!file || !path) {
            return new Response(JSON.stringify({ error: 'File and path are required' }), { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const key = `${path}/${file.name}`;
        const contentType = file.type || 'application/octet-stream'; // Get the MIME type of the file

        // Upload to S3
        const s3Url = await uploadToS3(Buffer.from(buffer), key, contentType);

        // Upload to Dovesoft API
        const handlerId = await uploadToDovesoft(file);

        return new Response(
            JSON.stringify({
                success: true,
                s3Url: s3Url, // Include the S3 URL
                handlerId: handlerId, // Include the handler ID
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error uploading file:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to upload file' }),
            { status: 500 }
        );
    }
}

// Function to upload the file to Dovesoft API
async function uploadToDovesoft(file) {
    const formData = new FormData();
    formData.append('file', file);

    const headers = {
        'wabaNumber': '918374047115', // Replace with the actual WABA number
        'Key': process.env.WHATSAPP_API_KEY, // Replace with your API key
    };

    try {
        const response = await fetch('https://api.dovesoft.io/REST/directApi/uploadMediaFile', {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Dovesoft API error: ${response.statusText}`);
        }

        const result = await response.json();
        return result.handlerid; // Return the handler ID from the response
    } catch (error) {
        console.error('Error uploading to Dovesoft API:', error);
        throw error;
    }
}