// seller.route.js
import express from 'express';
import { registerSeller, loginSeller, getSellerAccountByParams, updateSellerAccount } from '../controllers/seller.controller.js';

const router = express.Router();

// Public routes
router.post('/register', registerSeller);
router.post('/login', loginSeller);

// Route to get seller account details
router.get('/account', getSellerAccountByParams);

// Route to update seller account details
router.put('/account/:id', updateSellerAccount); // Define this correctly now

export default router;
