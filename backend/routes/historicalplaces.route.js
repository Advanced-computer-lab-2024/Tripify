import express from 'express';
import { createHistoricalPlace, getHistoricalPlaceById, getAllHistoricalPlaces, updateHistoricalPlace, deleteHistoricalPlace } from '../controllers/histroicalplace.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();


router.use(protect);


router.post('/create', restrictTo('tourism governor'), createHistoricalPlace);
router.put('/:id', restrictTo('tourism governor'), updateHistoricalPlace);
router.delete('/:id', restrictTo('tourism governor'), deleteHistoricalPlace);


router.get('/:id', getHistoricalPlaceById);
router.get('/', getAllHistoricalPlaces);

export default router;
