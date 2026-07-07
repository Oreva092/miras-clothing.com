import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String, required: true },
  items: [
    {
      productId: { type: String },
      title: { type: String },
      price: { type: Number },
      quantity: { type: Number }
    }
  ],
  totalAmount: { type: Number, required: true },
  paystackReference: { type: String, required: true },
  status: { type: String, default: 'paid' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Order', orderSchema);