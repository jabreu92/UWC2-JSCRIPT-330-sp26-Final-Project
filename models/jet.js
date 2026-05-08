import mongoose from 'mongoose';

const jetSchema = new mongoose.Schema({
  sku: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true 
  },
  year: { 
    type: Number, 
    required: true,
    min: [1900, "Year must be 1900 or later"], 
    max: [new Date().getFullYear() + 2, "Year cannot be too far in the future"] 
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  
  manufacturer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Manufacturer', 
    required: true 
  }
}, { timestamps: true });

export default mongoose.model('Jet', jetSchema);