import { Router } from 'express';
import jet from './jet';
import manufacturer from './manufacturer';
import user from './user';
import order from './order';
import login from './login';

const router = Router();

router.use('/jet', jet);
router.use('/manufacturer', manufacturer);
router.use('/user', user);
router.use('/order', order);
router.use('/login', login);

export default router;
