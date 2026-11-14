import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
import commonRoutes from './routes/commonRoutes.js';
import { getFileStreamFromB2 } from './services/b2Service.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Serve static media files from local disk if present
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// 2. High-speed Fallback: Stream directly from Backblaze B2 bucket (calthx/waytoonerd/...)
app.get('/uploads/*', async (req, res, next) => {
  const fileSubPath = req.params[0];
  try {
    const s3Response = await getFileStreamFromB2(fileSubPath);
    if (s3Response.ContentType) {
      res.setHeader('Content-Type', s3Response.ContentType);
    }
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    s3Response.Body.pipe(res);
  } catch (err) {
    res.status(404).send('Image not found');
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api', commonRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Connect to MongoDB & Start Server
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waytoonerd')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`WayTooNerd API Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

