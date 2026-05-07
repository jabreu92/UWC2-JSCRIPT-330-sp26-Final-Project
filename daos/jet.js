import Jet from '../models/jet';
// CRUD Operations for Jet
export const createOneJet = async (data) => Jet.insertOne(data);