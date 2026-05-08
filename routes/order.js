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

/**
 * --- PUBLIC/USER ACCESS ---
 * 'protect' ensures the user is logged in and req.user is populated
 */

// POST: Create a new purchase (User action)
router.post('/', protect, createPurchase);

// GET: Fetch history (User sees theirs, Admin sees all)
router.get('/', protect, getOrders);
router.get('/:orderNumber', protect, getOrderByNumber);


/**
 * --- ADMIN ONLY ACCESS ---
 * 'authorizeAdmin' ensures only users with the 'admin' role can proceed
 */

// PATCH: Approve an order via JSON body { "serialNumber": "SN-XXXXXX" }
router.patch('/:orderNumber', protect, authorizeAdmin, updateStatus);

// DELETE: Remove an order record and re-list the jet by ID
router.delete('/:orderNumber', protect, authorizeAdmin, deleteOrder);
export default router;
