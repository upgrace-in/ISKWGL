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

        const s3Url = await uploadToS3(Buffer.from(buffer), key);

        return new Response(JSON.stringify({ success: true, url: s3Url }), { status: 200 });
    } catch (error) {
        console.error('Error uploading file:', error);
        return new Response(JSON.stringify({ error: 'Failed to upload file' }), { status: 500 });
    }
}