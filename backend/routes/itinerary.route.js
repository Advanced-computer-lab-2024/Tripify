import express from 'express';
import { createItinerary,getAllItineraries,updateItinerary,getItineraryById,deleteItinerary } from '../controllers/itinerary.controller.js';
const router = express.Router();
router.post('/', createItinerary);
router.get('/', getAllItineraries);
router.get('/:id', getItineraryById);
router.put('/:id', updateItinerary);
router.delete('/:id', deleteItinerary);
export default router;