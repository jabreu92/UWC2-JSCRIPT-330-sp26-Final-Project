import mongoose from 'mongoose';

const jetModelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  range: String, // e.g., "7,500 nm"
  capacity: Number,
  price: { type: Number, required: true },
  manufacturer: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer', required: true },
  isAvailable: { type: Boolean, default: true } // Toggle this if the last one is sold
});

export default mongoose.model('Jet', jetModelSchema);