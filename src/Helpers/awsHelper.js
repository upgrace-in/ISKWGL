import AWS from 'aws-sdk';
import { config } from '../app/api/handleWebhook/config';

AWS.config.update({
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
    region: config.aws.region
});

const s3 = new AWS.S3();

export const uploadToS3 = async (buffer, key) => {
    const s3Params = {
        Bucket: 'myawswarangalbucket',
        Key: key,
        Body: buffer,
        ContentType: 'application/pdf'
    };

    try {
        const s3Response = await s3.upload(s3Params).promise();
        return s3Response.Location;
    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw error;
    }
};