import { Router } from 'express';
import { createJet, getJets, getJetBySku, updateJet, deleteJet } from '../controller/jet.js';
import { protect, authorizeAdmin } from '../middleware/middleware.js';

const router = Router();

// PUBLIC/REGULAR ACCESS (Must be logged in)
router.get('/', protect, getJets);
router.get('/:sku', getJetBySku);

// ADMIN ONLY ACCESS
router.post('/', protect, authorizeAdmin, createJet);
router.patch('/:sku', protect, authorizeAdmin, updateJet);
router.delete('/:sku', protect, authorizeAdmin, deleteJet);

export default router;
