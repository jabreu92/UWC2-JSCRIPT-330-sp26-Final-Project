import { Router } from 'express';
import { 
  createPurchase, 
  getOrders, 
  approveOrderBySerial, 
  deleteOrder 
} from '../controller/order.js';
import { protect, authorizeAdmin } from '../middleware/middleware.js';

const router = Router();

/**
 * --- PUBLIC/USER ACCESS ---
 * 'protect' ensures the user is logged in and req.user is populated
 */

// POST: Create a new purchase (User action)
router.post('/', protect, createPurchase);

// GET: Fetch history (User sees theirs, Admin sees all)
router.get('/', protect, getOrders);


/**
 * --- ADMIN ONLY ACCESS ---
 * 'authorizeAdmin' ensures only users with the 'admin' role can proceed
 */

// PATCH: Approve an order via JSON body { "serialNumber": "SN-XXXXXX" }
router.patch('/approve', protect, authorizeAdmin, approveOrderBySerial);

// DELETE: Remove an order record and re-list the jet by ID
router.delete('/:id', protect, authorizeAdmin, deleteOrder);
export default router;
