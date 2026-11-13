import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  wpId: { type: Number, index: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  content: { type: String, default: '' },
  excerpt: { type: String, default: '' },
  status: { type: String, enum: ['publish', 'draft', 'trash'], default: 'publish', index: true },
  author: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: 'Sachin' }
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  categoryNames: [{ type: String }],
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  tagNames: [{ type: String }],
  featuredImage: {
    url: { type: String, default: '' },
    alt: { type: String, default: '' }
  },
  views: { type: Number, default: 0, index: true },
  publishedAt: { type: Date, default: Date.now, index: true },
  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    focusKeyword: { type: String, default: '' },
    canonicalUrl: { type: String, default: '' }
  }
}, { timestamps: true });

PostSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

export default mongoose.model('Post', PostSchema);

