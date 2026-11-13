import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  wpTermId: { type: Number, index: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  postCount: { type: Number, default: 0 },
  icon: { type: String, default: '' },
  seo: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    focusKeyword: { type: String, default: '' }
  }
}, { timestamps: true });

export default mongoose.model('Category', CategorySchema);

