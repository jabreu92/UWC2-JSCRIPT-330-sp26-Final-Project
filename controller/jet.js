import {
  createOneJet,
  getAllJets,
  findAvailableJets,
  findJetBySku,
  updateOneJetBySku,
  deleteOneJetBySku
} from '../daos/jet';
import mongoose from 'mongoose';

// Helper to check if an ID is a valid MongoDB ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// --- CREATE ---
export const createJet = async (req, res) => {
  try {
    // 1. Extract the new fields (sku and year) from req.body
    const { sku, name, year, range, capacity, price, manufacturer } = req.body;

    // 2. Presence Validation (Updated to include sku and year)
    if (!sku || !name || !year || !price || !manufacturer) {
      return res.status(400).json({
        message: "SKU, Name, Year, Price, and Manufacturer are required."
      });
    }

    // 3. Data Type/Logic Validation
    if (price <= 0 || year < 1900) {
      return res.status(400).json({ message: "Price must be positive and Year must be valid." });
    }

    // 4. ID Format Validation
    if (!isValidId(manufacturer)) {
      return res.status(400).json({ message: "Invalid manufacturer ID format." });
    }

    // 5. Pass ALL fields to the DAO
    const newJet = await createOneJet({
      sku,
      name,
      year,
      range,
      capacity,
      price,
      manufacturer
    });

    res.status(201).json({ message: "Jet created successfully", data: newJet });
  } catch (error) {
    if (error.message.includes('E11000')) {
      return res.status(400).json({ message: "A jet with this SKU already exists." });
    }
    res.status(500).json({ message: "Error creating jet", error: error.message });
  }
};

// --- GET ---
export const getJetBySku = async (req, res) => {
  try {
    const { sku } = req.params; // Expecting /api/jets/:sku

    if (!sku) {
      return res.status(400).json({ message: "SKU is required." });
    }

    const jet = await findJetBySku(sku);

    if (!jet) {
      return res.status(404).json({ message: `Jet with SKU ${sku} not found.` });
    }

    res.status(200).json({ data: jet });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving jet", error: error.message });
  }
};

// --- GET ALL ---

// --- GET ALL (Role-Based) ---
export const getJets = async (req, res) => {
  try {
    let jets;

    // Logic: Admins see the full list, regular users see only available jets
    if (req.user && req.user.role === 'admin') {
      jets = await getAllJets();
    } else {
      jets = await findAvailableJets();
    }

    res.status(200).json({
      count: jets.length,
      data: jets
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving the jet catalog",
      error: error.message
    });
  }
};

// --- UPDATE ---
export const updateJet = async (req, res) => {
  try {
    const { sku } = req.params; // Captured from URL: /api/jets/:sku

    if (!sku) {
      return res.status(400).json({ message: "SKU is required for update." });
    }
    if (req.body.price !== undefined && req.body.price <= 0) {
      return res.status(400).json({ message: "Price must be a positive number." });
    }
    // Prevent stripping key data
    if (req.body.name === "" || req.body.price === 0) {
      return res.status(400).json({ message: "Name or Price cannot be empty." });
    }

    const updated = await updateOneJetBySku(sku, req.body);

    if (!updated) {
      return res.status(404).json({ message: `Jet with SKU ${sku} not found.` });
    }

    res.status(200).json({ message: "Jet updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// --- DELETE ---
export const deleteJet = async (req, res) => {
  try {
    const { sku } = req.params;

    const deleted = await deleteOneJetBySku(sku);

    if (!deleted) {
      return res.status(404).json({ message: `Jet with SKU ${sku} not found.` });
    }

    res.status(200).json({ message: `Jet ${sku} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};