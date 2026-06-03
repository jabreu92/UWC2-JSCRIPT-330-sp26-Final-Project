import Jet from '../models/jet';

export const createOneJet = async (data) => {
  try {
    return await Jet.create(data);
  } catch (error) {
    throw new Error(`DAO Error (Create): ${error.message}`);
  }
};

export const findJetBySku = async (sku) => {
  try {
    return await Jet.findOne({ sku: sku.toUpperCase() })
      .populate('manufacturer')
      .lean();
  } catch (error) {
    throw new Error(`DAO Error (findJetBySku): ${error.message}`);
  }
};

export const getAllJets = async () => {
  try {
    return await Jet.find()
      .populate('manufacturer', 'name')
      .sort({ createdAt: -1 }) // Add sort for Admins to look created jets easily
      .lean();
  } catch (error) {
    throw new Error(`DAO Error (GetAll): ${error.message}`);
  }
};

export const findAvailableJets = async () => {
  try {
    return await Jet.find({ isAvailable: true })
      .populate('manufacturer', 'name')
      .sort({ price: 1 }) // Users get a sorted list based on price
      .lean();
  } catch (error) {
    throw new Error(`DAO Error (FindAvailable): ${error.message}`);
  }
};

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

export const deleteOneJetBySku = async (sku) => {
  try {
    return await Jet.findOneAndDelete({ sku: sku.toUpperCase() });
  } catch (error) {
    throw new Error(`DAO Error (DeleteBySku): ${error.message}`);
  }
};

export const getCatalogPerformance = async () => {
  return await Jet.find({ isAvailable: true })
    .sort({ price: 1 })
    .explain('executionStats');
};

export const searchJets = async (searchTerm) => {
  return await Jet.find({
    name: { $regex: searchTerm, $options: 'i' } // 'i' makes it case-insensitive
  });
};