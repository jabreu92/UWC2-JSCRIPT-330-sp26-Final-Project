import mongoose from 'mongoose';

const manufacturerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: String,
  foundedYear: Number
});

export default mongoose.model('Manufacturer', manufacturerSchema);