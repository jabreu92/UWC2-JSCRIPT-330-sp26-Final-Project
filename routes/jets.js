import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
    res.json({hello: "world"})
});

export default router;
