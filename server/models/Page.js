import mongoose from 'mongoose';

const PageSchema = new mongoose.Schema({
  wpId: { type: Number, index: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  content: { type: String, default: '' },
  status: { type: String, enum: ['publish', 'draft'], default: 'publish' },
  layout: { type: String, default: 'standard' },
  heroBanners: [{
    title: String,
    videoUrl: String,
    imageUrl: String,
    gridSpan: Number
  }],
  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' }
  }
}, { timestamps: true });

export default mongoose.model('Page', PageSchema);

