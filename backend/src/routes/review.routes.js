import express from 'express';
import {
  getBookReviews,
  createReview
} from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/book/:bookId', getBookReviews);
router.post('/book/:bookId', protect, createReview);

export default router;
