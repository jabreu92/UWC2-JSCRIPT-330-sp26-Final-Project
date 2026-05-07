import { Router } from 'express';
import { createManufacturer } from '../controller/manufacturer.js';

const router = Router();

router.post('/manufacturer', createManufacturer);

export default router;
