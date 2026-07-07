import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 4 },
  badges: [{ type: String }],
  description: { type: String },
  soldOut: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  category: { type: String, default: 'clothing' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', productSchema);