import Jet from '../models/jet';

// --- CREATE ---
export const createOneJet = async (data) => {
  try {
    return await Jet.create(data);
  } catch (error) {
    throw new Error(`DAO Error (Create): ${error.message}`);
  }
};

// --- READ SINGLE ---
export const findJetBySku = async (sku) => {
  try {
    return await Jet.findOne({ sku: sku.toUpperCase() })
      .populate('manufacturer')
      .lean();
  } catch (error) {
    throw new Error(`DAO Error (findJetBySku): ${error.message}`);
  }
};

// --- READ ALL (Admin) ---
export const getAllJets = async () => {
  try {
    return await Jet.find().populate('manufacturer', 'name').lean();
  } catch (error) {
    throw new Error(`DAO Error (GetAll): ${error.message}`);
  }
};

// --- READ AVAILABLE (User) ---
export const findAvailableJets = async () => {
  try {
    return await Jet.find({ isAvailable: true })
      .populate('manufacturer', 'name')
      .lean();
  } catch (error) {
    throw new Error(`DAO Error (FindAvailable): ${error.message}`);
  }
};

// --- UPDATE ---
export const updateOneJetBySku = async (sku, updateData) => {
  try {
    return await Jet.findOneAndUpdate(
      { sku: sku.toUpperCase() },
      updateData,
      { new: true, runValidators: true }
    ).populate('manufacturer');
  } catch (error) {
    throw new Error(`DAO Error (UpdateBySku): ${error.message}`);
  }
};

// --- DELETE ---
export const deleteOneJetBySku = async (sku) => {
  try {
    return await Jet.findOneAndDelete({ sku: sku.toUpperCase() });
  } catch (error) {
    throw new Error(`DAO Error (DeleteBySku): ${error.message}`);
  }
};