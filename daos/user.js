import User from '../models/user';

export const createOneUser = async (data) => await User.create(data);

export const findAllUsers = async () => await User.find().select('-password').lean();

export const findByEmail = async (email) => {
    return await User.findOne({ email: email.toLowerCase() });
};

export const findById = async (id) => {
  return await await User.findOne({ _id: id  });
};

export const updateOneUser = async (email, data) => {
    return await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        data,
        { new: true, runValidators: true }
    ).select('-password');
};

export const deleteOneUser = async (email) => {
    return await User.findOneAndDelete({ email: email.toLowerCase() });
};

export const updatePasswordByEmail = async (email, newHashedPassword) => {
    try {
        return await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            { password: newHashedPassword },
            { new: true }
        ).select('-password');
    } catch (error) {
        throw new Error(`DAO Error (UpdatePassword): ${error.message}`);
    }
};