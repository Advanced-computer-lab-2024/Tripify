import express from 'express';
import {createHistoricalPlace,getAllHistoricalPlaces,getHistoricalPlaceById,updateHistoricalPlace,deleteHistoricalPlace} from '../controllers/histroicalplace.controller.js';

const router = express.Router();

router.post('/', createHistoricalPlace);
router.get('/', getAllHistoricalPlaces);
router.get('/:id', getHistoricalPlaceById);
router.put('/:id', updateHistoricalPlace);
router.delete('/:id', deleteHistoricalPlace);

export default router;