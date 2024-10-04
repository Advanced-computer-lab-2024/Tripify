import express from 'express';
import {deleteAccount}  from '../controllers/adminController.js';
import {addTourismGovernor}  from '../controllers/TourismGovernor.controller.js';

const router = express.Router();

router.delete('/delete/:id', deleteAccount);
router.post('/add-governor', addTourismGovernor);

export default router;