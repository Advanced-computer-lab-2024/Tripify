import express from 'express';
import { getTouristProfile, loginTourist, registerTourist, updateTouristProfile } from '../controllers/tourist.controller.js';




const router = express.Router();

router.post('/register', registerTourist);
router.post('/login', loginTourist);
router.get('/profile/:username', getTouristProfile); 
router.put('/profile/:username', updateTouristProfile);

export default router;