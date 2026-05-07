import { Router } from 'express';
import jets from './jets';

const router = Router();

router.use('/jets', jets);

export default router;
