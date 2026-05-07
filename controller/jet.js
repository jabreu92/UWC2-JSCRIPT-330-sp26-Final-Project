import { createOneJet } from '../daos/jet'

export const createJet = async (req, res) => {
  try {
    const { name, range, capacity, price, manufacturer } = req.body;

    // Basic validation
    if (!name || !price || !manufacturer) {
      return res.status(400).json({ message: "Name, price, and manufacturer are required." });
    }

    const newJet = await createOneJet({
      name,
      range,
      capacity,
      price,
      manufacturer // This should be the MongoDB ID of the manufacturer
    });

    res.status(201).json({
      message: "Jet created successfully",
      data: newJet
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating jet", error: error.message });
  }
};