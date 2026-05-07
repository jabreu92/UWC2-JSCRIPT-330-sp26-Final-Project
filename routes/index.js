import { Router } from 'express';
import jet from './jet';

const router = Router();

router.use('/jet', jet);

export default router;
