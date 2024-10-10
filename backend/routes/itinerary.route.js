import express from 'express';
import { createItinerary, getItineraryById, getAllItineraries, updateItinerary, deleteItinerary, searchItineraries } from '../controllers/itinerary.controller.js';
// import { authenticateUser } from '../middleware/auth.middleware.js'; // Assuming you have authentication middleware

const router = express.Router();

router.post('/', createItinerary);
router.get('/', getAllItineraries);
router.get('/search', searchItineraries);
router.get('/:id', getItineraryById);
router.put('/:id', updateItinerary);
router.delete('/:id', deleteItinerary);

export default router;