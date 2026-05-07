import { Router } from 'express';
import jet from './jet';
import manufacturer from './manufacturer';

const router = Router();

router.use('/jet', jet);
router.use('/manufacturer', manufacturer);

export default router;
