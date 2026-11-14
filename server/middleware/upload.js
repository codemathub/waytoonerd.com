import multer from 'multer';

// Use memoryStorage so uploaded images and videos can be directly streamed to Backblaze B2
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100 MB max for images and video clips
});


