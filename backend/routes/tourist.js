import express from 'express';
import { getTouristProfile, updateTouristProfile } from'../controllers/touristController.js';
const router = express.Router();


router.get('/:id', getTouristProfile);
router.put('/:id', updateTouristProfile);

export default router;