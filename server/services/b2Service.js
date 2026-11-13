import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

const s3Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT,
  region: process.env.B2_REGION,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APP_KEY
  }
});

const BUCKET = process.env.B2_BUCKET_NAME || 'calthx';
const B2_PUBLIC_URL = process.env.B2_PUBLIC_URL || 'https://calthx.s3.us-east-005.backblazeb2.com';
const FOLDER = process.env.B2_FOLDER || 'waytoonerd';

/**
 * Upload a single file buffer to Backblaze B2 under the waytoonerd folder
 * @param {Buffer} buffer - File buffer
 * @param {string} originalname - Original file name
 * @param {string} mimetype - Content MIME type
 * @returns {Promise<{ url: string, key: string }>}
 */
export async function uploadToB2(buffer, originalname, mimetype) {
  const sanitizedName = originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
  const datePrefix = new Date().toISOString().slice(0, 7).replace('-', '/'); // "2026/11"
  const key = `${FOLDER}/${datePrefix}/${Date.now()}-${sanitizedName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype
  });

  await s3Client.send(command);

  const publicUrl = `${B2_PUBLIC_URL}/${key}`;
  return { url: publicUrl, key };
}

export default { uploadToB2, s3Client };

