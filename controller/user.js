import * as UserDAO from '../daos/user.js';
const bcrypt = require('bcrypt');

export const registerUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1. Check if user exists
    const userExists = await UserDAO.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create user
    const newUser = await UserDAO.createOneUser({
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

// READ ALL
export const getUsers = async (req, res) => {
    try {
        const users = await UserDAO.findAllUsers();
        res.status(200).json({ count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// READ ONE
export const getUserByEmail = async (req, res) => {
    try {
        const user = await UserDAO.findByEmail(req.params.email);
        if (!user) return res.status(404).json({ message: "User not found" });
        
        const { password, ...userData } = user.toObject();
        res.status(200).json({ data: userData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE
export const updateUser = async (req, res) => {
    try {
        const { email } = req.params;
        const updateData = { ...req.body };

        // If password is being updated, hash it first
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        const updated = await UserDAO.updateOneUser(email, updateData);
        if (!updated) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ message: "User updated", data: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE
export const changeOwnPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const email = req.user.email; // Taken from the 'protect' middleware token

    // 1. Find user
    const user = await UserDAO.findByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password incorrect" });
    }

    // 3. Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. Update
    await UserDAO.updatePasswordByEmail(email, hashedPassword);

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
export const deleteUser = async (req, res) => {
    try {
        const deleted = await UserDAO.deleteOneUser(req.params.email);
        if (!deleted) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};