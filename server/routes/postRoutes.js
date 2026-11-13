import express from 'express';
import Post from '../models/Post.js';
import Category from '../models/Category.js';
import Tag from '../models/Tag.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: Get all posts (with search, category, tag filters, pagination)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, search, status = 'publish' } = req.query;
    const query = { status };

    if (category) {
      const catObj = await Category.findOne({ slug: category });
      if (catObj) {
        query.categories = catObj._id;
      }
    }

    if (tag) {
      const tagObj = await Tag.findOne({ slug: tag });
      if (tagObj) {
        query.tags = tagObj._id;
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('categories', 'name slug')
      .populate('tags', 'name slug')
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      posts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public: Get popular posts by view count
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const posts = await Post.find({ status: 'publish' })
      .populate('categories', 'name slug')
      .sort({ views: -1 })
      .limit(limit);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public: Get recent posts
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const posts = await Post.find({ status: 'publish' })
      .populate('categories', 'name slug')
      .sort({ publishedAt: -1 })
      .limit(limit);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public: Get single post by slug and increment views
router.get('/:slug', async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { slug: req.params.slug, status: 'publish' },
      { $inc: { views: 1 } },
      { new: true }
    )
    .populate('categories', 'name slug')
    .populate('tags', 'name slug');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Get related posts in same category
    let relatedPosts = [];
    if (post.categories && post.categories.length > 0) {
      relatedPosts = await Post.find({
        status: 'publish',
        _id: { $ne: post._id },
        categories: { $in: post.categories.map(c => c._id) }
      })
      .limit(3)
      .select('title slug featuredImage publishedAt excerpt');
    }

    res.json({ post, relatedPosts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Create Post
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const post = new Post({
      ...req.body,
      author: {
        id: req.user._id,
        name: req.user.displayName || req.user.username
      }
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: Update Post
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: Delete Post
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

