import { Router } from 'express';
import { 
    createJet, 
    getJets, 
    getJetBySku, 
    updateJet, 
    deleteJet,
    searchJets,     
} from '../controller/jet.js';
import { protect, authorizeAdmin } from '../middleware/middleware.js';

const router = Router();

// 1. SPECIFIC PATHS FIRST (Static routes)
// These must be above /:sku, otherwise /:sku will think "search" is a SKU name.
router.get('/search', searchJets);

// 2. GENERAL LISTS
router.get('/', protect, getJets);

// 3. PARAMETERIZED PATHS LAST (Dynamic routes)
router.get('/:sku', getJetBySku);

// 4. ADMIN ONLY ACCESS (Mutations)
router.post('/', protect, authorizeAdmin, createJet);
router.patch('/:sku', protect, authorizeAdmin, updateJet);
router.delete('/:sku', protect, authorizeAdmin, deleteJet);

export default router;