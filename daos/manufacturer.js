import Manufacturer from '../models/manufacturer';

export const createOneManufacturer = async (data) => {
  return await Manufacturer.create(data);
};

export const findByCode = async (code) => {
  try {
    return await Manufacturer.findOne({ code: code.toUpperCase() }).lean();
  } catch (error) {
    throw new Error(`DAO Error (FindByCode): ${error.message}`);
  }
};

export const findAllManufacturers = async () => {
  try {
    return await Manufacturer.find().lean();
  } catch (error) {
    throw new Error(`DAO Error (FindAll): ${error.message}`);
  }
};

export const updateOneManufacturerByCode = async (code, data) => {
  try {
    return await Manufacturer.findOneAndUpdate(
      { code: code.toUpperCase() }, 
      data, 
      { new: true, runValidators: true }
    );
  } catch (error) {
    throw new Error(`DAO Error (UpdateByCode): ${error.message}`);
  }
};

export const deleteOneManufacturerByCode = async (code) => {
  try {
    console.log('SIII')
    return await Manufacturer.findOneAndDelete({ code: code.toUpperCase() });
  } catch (error) {
    console.log('Que paso')
    throw new Error(`DAO Error (DeleteByCode): ${error.message}`);
  }
};