import { Router } from 'express';
import { 
  createManufacturer, 
  updateManufacturer, 
  deleteManufacturer, 
  getManufacturerByCode, 
  getManufacturers 
} from '../controller/manufacturer.js';
import { protect, authorizeAdmin } from '../middleware/middleware.js';

const router = Router();

// Everyone can view
router.get('/', getManufacturers);
router.get('/:code', getManufacturerByCode); // Now uses code e.g., /api/manufacturers/BOM

// Only Admins
router.post('/', protect, authorizeAdmin, createManufacturer);
router.put('/:code', protect, authorizeAdmin, updateManufacturer);
router.delete('/:code', protect, authorizeAdmin, deleteManufacturer);

export default router;