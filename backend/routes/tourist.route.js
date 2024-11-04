<<<<<<< HEAD
import express from 'express';
import { registerTourist,loginTourist,getTouristProfile,updateTouristProfile, getAllTourists } from '../controllers/tourist.controller.js';




const router = express.Router();

router.post('/register', registerTourist);
router.post('/login', loginTourist);
router.get('/',getAllTourists);
router.get('/profile/:username', getTouristProfile); 
router.put('/profile/:username', updateTouristProfile);

=======
import express from 'express';
import { registerTourist,loginTourist,getTouristProfile,updateTouristProfile, getAllTourists } from '../controllers/tourist.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';



const router = express.Router();

router.post('/register', registerTourist);
router.post('/login', loginTourist);
router.get('/',getAllTourists);
router.get('/profile/:username',authMiddleware, getTouristProfile); 
router.put('/profile/:username',authMiddleware, updateTouristProfile);

>>>>>>> jwtdemo
export default router;