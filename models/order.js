
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true 
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jet: { type: mongoose.Schema.Types.ObjectId, ref: 'Jet', required: true },
  finalSalePrice: Number,
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);