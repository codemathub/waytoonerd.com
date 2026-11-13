import mongoose from 'mongoose';

const SubscriberSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  status: { type: String, enum: ['subscribed', 'unsubscribed'], default: 'subscribed' },
  source: { type: String, default: 'website' }
}, { timestamps: true });

export default mongoose.model('Subscriber', SubscriberSchema);

