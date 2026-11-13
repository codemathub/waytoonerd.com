import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  wpId: { type: Number, index: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'editor', 'author', 'subscriber'], default: 'admin' },
  registeredAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);

