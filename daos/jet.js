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
export const findJetById = async (id) => {
  try {
    // .populate('manufacturer') is added here too so the UI gets full details
    return await Jet.findById(id).populate('manufacturer', 'name').lean();
  } catch (error) {
    throw new Error(`DAO Error (FindById): ${error.message}`);
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
export const updateOneJet = async (id, data) => {
  try {
    // { new: true } returns the document AFTER the update
    // { runValidators: true } ensures the update follows schema rules (like min price)
    return await Jet.findByIdAndUpdate(id, data, { 
      new: true, 
      runValidators: true 
    }).populate('manufacturer', 'name');
  } catch (error) {
    throw new Error(`DAO Error (Update): ${error.message}`);
  }
};

// --- DELETE ---
export const deleteOneJet = async (id) => {
  try {
    return await Jet.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`DAO Error (Delete): ${error.message}`);
  }
};