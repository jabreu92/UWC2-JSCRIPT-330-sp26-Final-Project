import * as ManufacturerDAO from '../daos/manufacturer.js';
import Jet from '../models/jet';

export const createManufacturer = async (req, res) => {
  try {
    const { code, name, country, foundedYear } = req.body;

    if (!code || !name) {
      return res.status(400).json({ message: "Code and Name are required." });
    }

    const existing = await ManufacturerDAO.findByCode(code);
    if (existing) {
      return res.status(409).json({ message: `Manufacturer with code ${code} already exists.` });
    }

    const newManufacturer = await ManufacturerDAO.createOneManufacturer({ code, name, country, foundedYear });
    res.status(201).json(newManufacturer);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getManufacturerByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const manufacturer = await ManufacturerDAO.findByCode(code);
    if (!manufacturer) return res.status(404).json({ message: "Manufacturer not found" });

    res.status(200).json({ data: manufacturer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getManufacturers = async (req, res) => {
  try {
    // 1. Call the DAO to fetch all records
    const manufacturers = await ManufacturerDAO.findAllManufacturers();

    // 2. Return the data with a 200 OK status
    // Including a 'count' is helpful for frontend developers
    res.status(200).json({
      count: manufacturers.length,
      data: manufacturers
    });
  } catch (error) {
    // 3. Handle potential database or server errors
    res.status(500).json({ 
      message: "Error retrieving manufacturers", 
      error: error.message 
    });
  }
};

export const updateManufacturer = async (req, res) => {
  try {
    const { code } = req.params;
    const updated = await ManufacturerDAO.updateOneManufacturerByCode(code, req.body);
    if (!updated) return res.status(404).json({ message: "Manufacturer not found" });

    res.status(200).json({ message: "Updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteManufacturer = async (req, res) => {
  try {
    const { code } = req.params;
    
    // 1. Find the manufacturer to get the _id for the Jet check
    const manufacturer = await ManufacturerDAO.findByCode(code);
    if (!manufacturer) return res.status(404).json({ message: "Manufacturer not found" });

    // 2. Prevent deletion if jets are linked to this manufacturer's _id
    const associatedJets = await Jet.countDocuments({ manufacturer: manufacturer._id });
    if (associatedJets > 0) {
      return res.status(400).json({
        message: `Cannot delete. There are ${associatedJets} jets linked to this code.`
      });
    }

    await ManufacturerDAO.deleteOneManufacturerByCode(code);
    res.status(200).json({ message: `Manufacturer ${code} deleted.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
