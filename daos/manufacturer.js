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

export const findById = async (id) => {
  try {
    const manufacturer = await Manufacturer.findOne({ _id: id  });
    return manufacturer;
  } catch (e) {
    return null;
  }
};