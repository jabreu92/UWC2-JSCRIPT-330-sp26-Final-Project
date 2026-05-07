import { Router } from 'express';
import { createJet } from '../controller/jet.js';

const router = Router();

router.get('/', async (req, res) => {
    res.json({hello: "world"})
});

router.post('/', createJet);


export default router;
