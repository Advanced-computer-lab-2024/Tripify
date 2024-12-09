import express from 'express';
import { 
  createHistoricalPlace,
  getAllHistoricalPlaces,
  getHistoricalPlacesByTags,
  getHistoricalPlaceById,
  updateHistoricalPlace,
  deleteHistoricalPlace 
} from '../controllers/histroicalplace.controller.js';

const router = express.Router();

// Route for creating a new historical place
router.post('/', createHistoricalPlace);

// Route for getting all historical places
router.get('/', getAllHistoricalPlaces);

// Route for filtering historical places by tags
router.get('/filter-by-tags', getHistoricalPlacesByTags);

// Route for getting a specific historical place by ID
router.get('/:id', getHistoricalPlaceById);

// Route for updating a historical place by ID
router.put('/:id', updateHistoricalPlace);

// Route for deleting a historical place by ID
router.delete('/:id', deleteHistoricalPlace);

export default router;
