
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jet: { type: mongoose.Schema.Types.ObjectId, ref: 'Jet', required: true },
  
  // This field turns the generic model into a unique instance
  instanceSerialNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    default: () => `SN-${Math.floor(Math.random() * 1000000)}` 
  },
  
  purchaseDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  finalSalePrice: Number // We capture the price at the moment of sale
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);