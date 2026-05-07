import Manufacturer from '../models/manufacturer';
// CRUD Operations for Jet
export const createOneManufacturer = async (data) => Manufacturer.insertOne(data);

export const findByName = async (name) => {
  try {
    const manufacturer = await Manufacturer.findOne({ name: name });
    return manufacturer;
  } catch (e) {
    return null;
  }
};