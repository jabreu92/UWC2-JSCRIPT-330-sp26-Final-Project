import { Router } from 'express';
import { createJet } from '../controller/jet.js';

const router = Router();

router.post('/', createJet);

export default router;
