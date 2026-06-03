import mongoose from 'mongoose';

const manufacturerSchema = new mongoose.Schema({
  // The unique "Human ID" (e.g., BOM, GUL, EMB)
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true,
    minlength: 2,
    maxlength: 10 
  },
  name: { type: String, required: true },
  country: String,
  foundedYear: Number
});

export default mongoose.model('Manufacturer', manufacturerSchema);