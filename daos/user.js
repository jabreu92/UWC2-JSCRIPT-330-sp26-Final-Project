import User from '../models/user';
// CRUD Operations for Jet
export const createOneUser = async (data) => User.insertOne(data);

export const findByEmail = async (email) => {
  try {
    const user = await User.findOne({ email: email });
    return user;
  } catch (e) {
    return null;
  }
};

export const findById = async (id) => {
  try {
    const user = await User.findOne({ _id: id  });
    return user;
  } catch (e) {
    return null;
  }
};