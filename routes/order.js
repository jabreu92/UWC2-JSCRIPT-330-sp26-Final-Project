import { Router } from 'express';
import { 
  createPurchase, 
  getOrders, 
  getOrderByNumber,
  updateStatus, 
  deleteOrder 
} from '../controller/order.js';
import { protect, authorizeAdmin } from '../middleware/middleware.js';

const router = Router();
// POST: Create a new purchase (User action)
router.post('/', protect, createPurchase);

// GET: Fetch history (User sees theirs, Admin sees all)
router.get('/', protect, getOrders);
router.get('/:orderNumber', protect, getOrderByNumber);

//  --- ADMIN ONLY ACCESS ---
// PATCH: Approve an order via JSON body { "serialNumber": "SN-XXXXXX" }
router.patch('/:orderNumber', protect, authorizeAdmin, updateStatus);
// DELETE: Remove an order record and re-list the jet by ID
router.delete('/:orderNumber', protect, authorizeAdmin, deleteOrder);
export default router;
