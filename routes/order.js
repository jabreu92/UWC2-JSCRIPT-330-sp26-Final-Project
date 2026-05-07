import { Router } from 'express';
import { createPurchase, approveOrderBySerial } from '../controller/order.js';
import { protect, authorizeAdmin } from '../middleware/middleware.js';

const router = Router();

router.post('/', protect, createPurchase);
router.patch('/approve', protect, authorizeAdmin, approveOrderBySerial);

export default router;
