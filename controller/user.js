import { findByEmail, createOneUser } from '../daos/user';
const bcrypt = require('bcrypt');

export const registerUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1. Check if user exists
    const userExists = await findByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create user
    const newUser = await createOneUser({
      email,
      password: hashedPassword,
      role: role || 'regular' // Default to regular if not specified
    });

    // 4. Return user (excluding password)
    res.status(201).json({
      _id: newUser._id,
      email: newUser.email,
      role: newUser.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};