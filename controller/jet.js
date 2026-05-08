import { 
  createOneJet, 
  getAllJets, 
  findAvailableJets, 
  findJetById, 
  updateOneJet, 
  deleteOneJet 
} from '../daos/jet';
import mongoose from 'mongoose';

// Helper to check if an ID is a valid MongoDB ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// --- CREATE ---
export const createJet = async (req, res) => {
  try {
    const { name, range, capacity, price, manufacturer } = req.body;

    // 1. Presence Validation
    if (!name || !price || !manufacturer) {
      return res.status(400).json({ message: "Name, price, and manufacturer are required." });
    }

    // 2. Data Type/Logic Validation
    if (price <= 0 || capacity <= 0) {
      return res.status(400).json({ message: "Price and capacity must be positive numbers." });
    }

    // 3. ID Format Validation
    if (!isValidId(manufacturer)) {
      return res.status(400).json({ message: "Invalid manufacturer ID format." });
    }

    const newJet = await createOneJet({ name, range, capacity, price, manufacturer });

    res.status(201).json({ message: "Jet created successfully", data: newJet });
  } catch (error) {
    res.status(500).json({ message: "Error creating jet", error: error.message });
  }
};

// --- GET ALL ---
export const getJets = async (req, res) => {
  try {
    const jets = req.user.role === 'admin' ? await getAllJets() : await findAvailableJets();

    // Check if the catalog is actually empty
    if (!jets || jets.length === 0) {
      return res.status(200).json({ message: "No jets found in the catalog.", data: [] });
    }

    res.status(200).json({ count: jets.length, data: jets });
  } catch (error) {
    res.status(500).json({ message: "Error fetching jets", error: error.message });
  }
};

// --- GET SINGLE ---
export const getJetById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid Jet ID format." });
    }

    const jet = await findJetById(id);
    if (!jet) return res.status(404).json({ message: "Jet not found." });

    res.status(200).json({ data: jet });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving jet", error: error.message });
  }
};

// --- UPDATE ---
export const updateJet = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid Jet ID format." });
    }

    // Prevent stripping the jet of its name or price accidentally
    if (req.body.name === "" || req.body.price === 0) {
      return res.status(400).json({ message: "Name or Price cannot be empty/zero during update." });
    }

    const updated = await updateOneJet(id, req.body);
    if (!updated) return res.status(404).json({ message: "Jet not found." });

    res.status(200).json({ message: "Jet updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// --- DELETE ---
export const deleteJet = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid Jet ID format." });
    }

    const deleted = await deleteOneJet(id);
    if (!deleted) return res.status(404).json({ message: "Jet not found." });

    res.status(200).json({ message: "Jet deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};