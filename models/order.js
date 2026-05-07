
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jet: { type: mongoose.Schema.Types.ObjectId, ref: 'JetModel', required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  totalPrice: Number
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);