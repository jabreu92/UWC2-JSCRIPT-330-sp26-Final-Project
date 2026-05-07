import { Router } from 'express';
import jet from './jet';
import manufacturer from './manufacturer';
import user from './user';

const router = Router();

router.use('/jet', jet);
router.use('/manufacturer', manufacturer);
router.use('/user', user);

export default router;
