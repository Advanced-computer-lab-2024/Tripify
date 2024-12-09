import express from 'express';
import ReviewController from '../controllers/review.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes - require authentication


// Fetch completed items eligible for review
router.get('/completed/tourguides', ReviewController.getCompletedTourGuides);
router.get('/completed/events', ReviewController.getCompletedEvents);
router.get('/completed/products', ReviewController.getCompletedProducts);

// Review CRUD operations
router.post('/', ReviewController.createReview);
router.get('/entity/:reviewType/:entityId', ReviewController.getEntityReviews);
router.get('/stats/:reviewType/:entityId', ReviewController.getEntityReviewStats);
router.put('/:id', ReviewController.updateReview);
router.delete('/:id', ReviewController.deleteReview);

// Review interactions
router.post('/:id/like', ReviewController.toggleLike);
router.post('/:id/report', ReviewController.reportReview);

export default router;