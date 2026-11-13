import mongoose from 'mongoose';

const ContactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['unread', 'read'], default: 'unread' },
  ip: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('ContactMessage', ContactMessageSchema);

