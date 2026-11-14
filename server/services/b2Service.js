import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
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
const FOLDER = process.env.B2_FOLDER || 'waytoonerd';

/**
 * Upload a single file buffer to Backblaze B2 under the waytoonerd folder
 */
export async function uploadToB2(buffer, originalname, mimetype) {
  const sanitizedName = originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
  const datePrefix = new Date().toISOString().slice(0, 7).replace('-', '/');
  const key = `${FOLDER}/${datePrefix}/${Date.now()}-${sanitizedName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype
  });

  await s3Client.send(command);

  // Return the relative proxy path so images load securely through https://waytoonerd.com/uploads/...
  const relativeUrl = `/uploads/${datePrefix}/${Date.now()}-${sanitizedName}`;
  return { url: relativeUrl, key };
}

/**
 * Get readable stream of a file from Backblaze B2
 */
export async function getFileStreamFromB2(key) {
  const fullKey = key.startsWith(`${FOLDER}/`) ? key : `${FOLDER}/${key}`;
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: fullKey
  });
  return await s3Client.send(command);
}

export default { uploadToB2, getFileStreamFromB2, s3Client };

