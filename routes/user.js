import { Router } from 'express';
import { 
    registerUser, 
    getUsers, 
    getUserByEmail, 
    updateUser, 
    deleteUser,
    changeOwnPassword 
} from '../controller/user.js';
import { protect, authorizeAdmin } from '../middleware/middleware.js';

const router = Router();

// Public: Create a user (Registration)
router.post('/', registerUser);
router.patch('/change-password', protect, changeOwnPassword);

// Admin Only: Manage users via email
router.get('/', protect, authorizeAdmin, getUsers);
router.get('/:email', protect, authorizeAdmin, getUserByEmail);
router.put('/:email', protect, authorizeAdmin, updateUser);
router.delete('/:email', protect, authorizeAdmin, deleteUser);

export default router;