import Jet from '../models/jet';
// CRUD Operations for Jet
export const createOneJet = async (data) => Jet.insertOne(data);

export const findJetById = async (id) => {
  try {
    const jet = await Jet.findOne({ _id: id  });
    return jet;
  } catch (e) {
    return null;
  }
};