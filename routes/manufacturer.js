import { Router } from 'express';
import { createManufacturer } from '../controller/manufacturer.js';
import { protect, authorizeAdmin } from '../middleware/middleware.js';

const router = Router();

// Only Admins can create manufacturers
router.post('/', protect, authorizeAdmin, createManufacturer);

export default router;
