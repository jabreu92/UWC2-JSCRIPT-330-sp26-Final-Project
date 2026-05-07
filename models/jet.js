import mongoose from 'mongoose';

const jetModelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  range: String, // e.g., "7,500 nm"
  capacity: Number,
  price: { type: Number, required: true },
  manufacturer: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer', required: true }
});

export default mongoose.model('JetModel', jetModelSchema);