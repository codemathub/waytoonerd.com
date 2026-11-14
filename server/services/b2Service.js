import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

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

  // Return the relative proxy path so images & videos load securely through https://waytoonerd.com/uploads/...
  const relativeUrl = `/uploads/${datePrefix}/${Date.now()}-${sanitizedName}`;
  return { url: relativeUrl, key };
}

/**
 * Get readable stream of a file from Backblaze B2
 * Automatically handles WordPress thumbnail suffixes (e.g. -1000x563, -300x200, etc.)
 */
export async function getFileStreamFromB2(key) {
  const cleanKey = key.replace(/^\/+/, '').replace(/^uploads\//, '');
  const fullKey = cleanKey.startsWith(`${FOLDER}/`) ? cleanKey : `${FOLDER}/${cleanKey}`;

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: fullKey
    });
    return await s3Client.send(command);
  } catch (err) {
    // If scaled version not found (e.g. image-1000x563.jpg), fallback to original (image.jpg)
    const scaledMatch = fullKey.match(/-\d+x\d+(\.[a-zA-Z0-9]+)$/);
    if (scaledMatch) {
      const originalKey = fullKey.replace(/-\d+x\d+(\.[a-zA-Z0-9]+)$/, '$1');
      try {
        const fallbackCmd = new GetObjectCommand({
          Bucket: BUCKET,
          Key: originalKey
        });
        return await s3Client.send(fallbackCmd);
      } catch (fallbackErr) {
        // Continue to throw original error
      }
    }
    throw err;
  }
}

export default { uploadToB2, getFileStreamFromB2, s3Client };
