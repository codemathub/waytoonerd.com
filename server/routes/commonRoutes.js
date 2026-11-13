import express from 'express';
import Setting from '../models/Setting.js';
import Subscriber from '../models/Subscriber.js';
import ContactMessage from '../models/ContactMessage.js';
import Post from '../models/Post.js';
import Category from '../models/Category.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Get settings
router.get('/settings', async (req, res) => {
  try {
    const settingsDocs = await Setting.find();
    const settings = {};
    for (const s of settingsDocs) {
      settings[s.key] = s.value;
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update settings
router.post('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await Setting.findOneAndUpdate({ key }, { key, value }, { upsert: true });
    }
    res.json({ message: 'Settings saved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public: Subscribe newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    await Subscriber.findOneAndUpdate(
      { email },
      { email, name: name || '', status: 'subscribed' },
      { upsert: true }
    );
    res.json({ message: 'Subscribed successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public: Contact form submit
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const msg = new ContactMessage({
      name,
      email,
      message,
      ip: req.ip
    });
    await msg.save();
    res.json({ message: 'Thank you for your message. It has been sent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Contact Messages Inbox
router.get('/contact-messages', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const msgs = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Subscribers List
router.get('/subscribers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const subs = await Subscriber.find().sort({ createdAt: -1 });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Upload Media
router.post('/media/upload', authenticateToken, requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const relativePath = req.file.path.split('public')[1].replace(/\\/g, '/');
  res.json({ url: relativePath, filename: req.file.filename });
});

// Admin: Dashboard Overview Stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const postCount = await Post.countDocuments({ status: 'publish' });
    const draftCount = await Post.countDocuments({ status: 'draft' });
    const categoryCount = await Category.countDocuments();
    const subscriberCount = await Subscriber.countDocuments();
    const messageCount = await ContactMessage.countDocuments({ status: 'unread' });

    const topPosts = await Post.find({ status: 'publish' })
      .sort({ views: -1 })
      .limit(5)
      .select('title slug views publishedAt');

    res.json({
      postCount,
      draftCount,
      categoryCount,
      subscriberCount,
      messageCount,
      topPosts
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public: Dynamic Sitemap.xml
router.get('/sitemap.xml', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'publish' }).select('slug updatedAt');
    const categories = await Category.find().select('slug');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `  <url><loc>https://waytoonerd.com/</loc><priority>1.0</priority></url>\n`;
    xml += `  <url><loc>https://waytoonerd.com/about-us</loc><priority>0.5</priority></url>\n`;
    xml += `  <url><loc>https://waytoonerd.com/contact-us</loc><priority>0.5</priority></url>\n`;
    xml += `  <url><loc>https://waytoonerd.com/privacy-policy</loc><priority>0.3</priority></url>\n`;

    for (const c of categories) {
      xml += `  <url><loc>https://waytoonerd.com/category/${c.slug}</loc><priority>0.8</priority></url>\n`;
    }

    for (const p of posts) {
      xml += `  <url><loc>https://waytoonerd.com/${p.slug}</loc><lastmod>${p.updatedAt.toISOString().split('T')[0]}</lastmod><priority>0.9</priority></url>\n`;
    }

    xml += `</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

export default router;

