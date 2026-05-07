import { createOneManufacturer, findByName } from '../daos/manufacturer'

export const createManufacturer = async (req, res) => {
  try {
    const { name, country, foundedYear } = req.body;

    // 1. Validation
    if (!name) {
      return res.status(400).json({ message: "Manufacturer name is required." });
    }

    // 2. Business Logic: Prevent duplicate names
    const existing = await findByName(name);
    if (existing) {
      return res.status(409).json({ 
        message: "A manufacturer with this name already exists.",
        manufacturerId: existing._id 
      });
    }

    // 3. Execution
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