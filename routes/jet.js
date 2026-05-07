import { Router } from 'express';
import { createJet } from '../controller/jet.js';
import { protect, authorizeAdmin } from '../middleware/middleware.js';

const router = Router();

// Logic:
// 1. protect: Validates the token and finds the user
// 2. authorizeAdmin: Checks if that user is an Admin
// 3. createJet: Actually runs the code to add a jet
router.post('/', protect, authorizeAdmin, createJet);

export default router;
