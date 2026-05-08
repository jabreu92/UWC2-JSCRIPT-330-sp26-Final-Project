import Manufacturer from '../models/manufacturer';
// CRUD Operations for Jet
export const createOneManufacturer = async (data) => Manufacturer.insertOne(data);

export const findByName = async (name) => {
  try {
    return await Manufacturer.findOne({ name: name });
  } catch (e) {
    throw new Error(`DAO Error (FindByName): ${error.message}`);
  }
};

export const findAllManufacturers = async () => {
  try {
    return await Manufacturer.find().lean();
  } catch (error) {
    throw new Error(`DAO Error (FindAll): ${error.message}`);
  }
};

export const findManufacturerById = async (id) => {
  try {
    return await Manufacturer.findById(id).lean();
  } catch (error) {
    throw new Error(`DAO Error (FindById): ${error.message}`);
  }
};

export const updateOneManufacturer = async (id, data) => {
  try {
    return await Manufacturer.findByIdAndUpdate(id, data, { 
      new: true, 
      runValidators: true 
    });
  } catch (error) {
    throw new Error(`DAO Error (Update): ${error.message}`);
  }
};

export const deleteOneManufacturer = async (id) => {
  try {
    return await Manufacturer.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`DAO Error (Delete): ${error.message}`);
  }
};