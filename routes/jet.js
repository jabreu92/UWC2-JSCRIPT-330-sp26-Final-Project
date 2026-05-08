import { Router } from 'express';
import { createJet, getJets, getJetById, updateJet, deleteJet } from '../controller/jet.js';
import { protect, authorizeAdmin } from '../middleware/middleware.js';

const router = Router();

// PUBLIC/REGULAR ACCESS (Must be logged in)
router.get('/', protect, getJets);
router.get('/:id', protect, getJetById);

// ADMIN ONLY ACCESS
router.post('/', protect, authorizeAdmin, createJet);
router.put('/:id', protect, authorizeAdmin, updateJet);
router.delete('/:id', protect, authorizeAdmin, deleteJet);

export default router;
