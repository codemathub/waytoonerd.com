import express from 'express';
import SuccessStory from '../models/SuccessStory.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: Get all success stories
router.get('/', async (req, res) => {
  try {
    const stories = await SuccessStory.find().sort({ order: 1, createdAt: -1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public: Get single success story
router.get('/:id', async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Success Story not found' });
    res.json(story);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Create success story
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const story = new SuccessStory(req.body);
    await story.save();
    res.status(201).json(story);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: Update success story
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const story = await SuccessStory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!story) return res.status(404).json({ message: 'Success Story not found' });
    res.json(story);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: Delete success story
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const story = await SuccessStory.findByIdAndDelete(req.params.id);
    if (!story) return res.status(404).json({ message: 'Success Story not found' });
    res.json({ message: 'Success Story deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
