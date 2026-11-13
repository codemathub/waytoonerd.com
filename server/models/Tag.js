import mongoose from 'mongoose';

const TagSchema = new mongoose.Schema({
  wpTermId: { type: Number, index: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  postCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Tag', TagSchema);

