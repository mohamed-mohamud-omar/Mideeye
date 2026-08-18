import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { Book } from '../models/Book.js';

export const getBookReviews = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID'
      });
    }

    const reviews = await Review.find({ bookId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID'
      });
    }

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5 || !comment?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating (1 to 5) and review comment.',
        errorCode: 'MISSING_FIELDS'
      });
    }

    // Verify if customer has actually purchased this book in a paid, non-cancelled order
    const verifiedOrder = await Order.findOne({
      userId,
      paymentStatus: 'SUCCESS',
      orderStatus: { $ne: 'CANCELLED' },
      'items.bookId': bookId
    });

    if (!verifiedOrder) {
      return res.status(403).json({
        success: false,
        message: 'Only customers who have successfully purchased this book can leave a review.',
        errorCode: 'PURCHASE_REQUIRED'
      });
    }

    // Check if user already reviewed this book
    const existingReview = await Review.findOne({ bookId, userId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this book.',
        errorCode: 'ALREADY_REVIEWED'
      });
    }

    const review = await Review.create({
      bookId,
      userId,
      userName: req.user.name,
      orderId: verifiedOrder._id,
      rating: numericRating,
      comment: comment.trim(),
      isVerifiedPurchase: true
    });

    // Recalculate book average rating
    const allReviews = await Review.find({ bookId });
    const totalScore = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = allReviews.length > 0 ? totalScore / allReviews.length : 0;

    await Book.findByIdAndUpdate(bookId, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length
    });

    res.status(201).json({
      success: true,
      message: 'Review posted successfully',
      data: review
    });
  } catch (error) {
    next(error);
  }
};
