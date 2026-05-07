import { Router } from 'express';
import { registerUser } from '../controller/user.js';

const router = Router();

router.post('/', registerUser);

export default router;
