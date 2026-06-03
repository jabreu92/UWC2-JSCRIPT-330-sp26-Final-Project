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

// Uses of indexes for faster lookup
jetSchema.index({ isAvailable: 1, price: 1 }); // Compound index for "Available jets sorted by price"
jetSchema.index({ manufacturer: 1 }); // Fast lookup for jets by a specific brand
jetSchema.index({ year: -1 }); // Quick sorting for "Newest Arrivals"
jetSchema.index({ createdAt: -1 }); // Admins need to see the jets that were most recently added to the system so we add this index for descend order    
// Compound: Optimizes query filtering by manufacturer and price
jetSchema.index({ manufacturerCode: 1, price: -1 });
// Text Search for Jet Name and Tail Number
jetSchema.index({ name: 'text', sku: 'text' });


export default mongoose.model('Jet', jetSchema);