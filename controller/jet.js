import * as JetDAO from '../daos/jet.js';
import { findByCode } from '../daos/manufacturer.js';
import mongoose from 'mongoose';

// Helper to check if an ID is a valid MongoDB ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// --- CREATE ---
export const createJet = async (req, res) => {
  try {
    const { sku, name, year, price, manufacturerCode, range, capacity } = req.body;

    // 1. Validation
    if (!sku || !manufacturerCode) {
      return res.status(400).json({ message: "SKU and Manufacturer Code are required." });
    }

    // 2. The Look-up: Convert Code -> ID
    const manufacturerDoc = await findByCode(manufacturerCode);
    
    if (!manufacturerDoc) {
      return res.status(404).json({ 
        message: `Manufacturer with code '${manufacturerCode}' not found. Please create the manufacturer first.` 
      });
    }

    // 3. Create the Jet using the ID found
    const newJet = await JetDAO.createOneJet({
      sku,
      name,
      year,
      price,
      range,
      capacity,
      manufacturer: manufacturerDoc._id // We use the internal ID for the database relationship
    });

    res.status(201).json({
      message: "Jet created successfully",
      data: newJet
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- GET ---
export const getJetBySku = async (req, res) => {
  try {
    const { sku } = req.params; // Expecting /api/jets/:sku

    if (!sku) {
      return res.status(400).json({ message: "SKU is required." });
    }

    const jet = await JetDAO.findJetBySku(sku);

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
      jets = await JetDAO.getAllJets();
    } else {
      jets = await JetDAO.findAvailableJets();
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

    const updated = await JetDAO.updateOneJetBySku(sku, req.body);

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

    const deleted = await JetDAO.deleteOneJetBySku(sku);

    if (!deleted) {
      return res.status(404).json({ message: `Jet with SKU ${sku} not found.` });
    }

    res.status(200).json({ message: `Jet ${sku} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};