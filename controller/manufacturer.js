import { createOneManufacturer, findByName, findAllManufacturers, findManufacturerById, updateOneManufacturer, deleteOneManufacturer } from '../daos/manufacturer';
import Jet from '../models/jet';
import mongoose from 'mongoose';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createManufacturer = async (req, res) => {
  try {
    const { name, country, foundedYear } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Manufacturer name is required." });
    }

    const existing = await findByName(name);
    if (existing) {
      return res.status(409).json({
        message: "A manufacturer with this name already exists.",
        manufacturerId: existing._id
      });
    }

    const newManufacturer = await createOneManufacturer({
      name,
      country,
      foundedYear
    });

    res.status(201).json(newManufacturer);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getManufacturers = async (req, res) => {
  try {
    const manufacturers = await findAllManufacturers();
    res.status(200).json({ count: manufacturers.length, data: manufacturers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getManufacturerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID format" });

    const manufacturer = await findManufacturerById(id);
    if (!manufacturer) return res.status(404).json({ message: "Not found" });

    res.status(200).json({ data: manufacturer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateManufacturer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID format" });

    const updated = await updateOneManufacturer(id, req.body);
    if (!updated) return res.status(404).json({ message: "Not found" });

    res.status(200).json({ message: "Updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteManufacturer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID format" });

    const deleted = await deleteOneManufacturer(id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    
    const associatedJets = await Jet.countDocuments({ manufacturer: id });
    if (associatedJets > 0) {
      return res.status(400).json({
        message: `Cannot delete. There are ${associatedJets} jets linked to this manufacturer.`
      });
    }

    res.status(200).json({ message: "Manufacturer deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};