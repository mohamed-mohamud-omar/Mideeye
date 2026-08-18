import express from 'express';
import {
  getBooks,
  getFeaturedBooks,
  getBestSellers,
  getNewArrivals,
  getBookById,
  getRelatedBooks,
  createBook,
  updateBook,
  deleteBook
} from '../controllers/book.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/role.middleware.js';

const router = express.Router();

// Public catalog routes
router.get('/', getBooks);
router.get('/featured', getFeaturedBooks);
router.get('/bestsellers', getBestSellers);
router.get('/new-arrivals', getNewArrivals);
router.get('/:id', getBookById);
router.get('/:id/related', getRelatedBooks);

// Admin-only book management
router.post('/', protect, adminOnly, createBook);
router.put('/:id', protect, adminOnly, updateBook);
router.delete('/:id', protect, adminOnly, deleteBook);

export default router;
