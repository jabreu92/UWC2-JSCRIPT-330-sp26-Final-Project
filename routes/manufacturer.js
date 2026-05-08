import { Router } from 'express';
import { createManufacturer, updateManufacturer, deleteManufacturer, getManufacturerById, getManufacturers } from '../controller/manufacturer.js';
import { protect, authorizeAdmin } from '../middleware/middleware.js';

const router = Router();


// Everyone can view manufacturers
router.get('/', getManufacturers);
router.get('/:id', getManufacturerById);

// Only Admins can modify the list
router.post('/', protect, authorizeAdmin, createManufacturer);
router.put('/:id', protect, authorizeAdmin, updateManufacturer);
router.delete('/:id', protect, authorizeAdmin, deleteManufacturer);

export default router;
