import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

const MIME_MAP = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain'
};

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

async function syncUploadsToB2() {
  console.log('--- Starting Backblaze B2 Upload Sync ---');
  console.log(`Bucket: ${BUCKET}, Target Folder: ${FOLDER}/`);
  const allFiles = getAllFiles(uploadsDir);
  console.log(`Found ${allFiles.length} files in local uploads folder.`);

  let uploaded = 0;
  let skipped = 0;
  let errors = 0;

  // Process files in batches of 15 for fast parallel upload
  const BATCH_SIZE = 15;
  for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
    const batch = allFiles.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (filePath) => {
        const relativePath = path.relative(uploadsDir, filePath).replace(/\\/g, '/');
        const key = `${FOLDER}/${relativePath}`;
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_MAP[ext] || 'application/octet-stream';

        try {
          const fileBuffer = fs.readFileSync(filePath);
          await s3Client.send(
            new PutObjectCommand({
              Bucket: BUCKET,
              Key: key,
              Body: fileBuffer,
              ContentType: contentType
            })
          );
          uploaded++;
        } catch (err) {
          errors++;
          console.error(`Failed ${key}:`, err.message);
        }
      })
    );

    if ((i + BATCH_SIZE) % 150 === 0 || i + BATCH_SIZE >= allFiles.length) {
      console.log(`Progress: ${Math.min(i + BATCH_SIZE, allFiles.length)} / ${allFiles.length} files processed...`);
    }
  }

  console.log(`\n=== B2 SYNC FINISHED ===`);
  console.log(`Uploaded: ${uploaded}`);
  console.log(`Errors: ${errors}`);
  console.log(`All assets are available at: ${B2_PUBLIC_URL}/${FOLDER}/...`);
}

syncUploadsToB2();

