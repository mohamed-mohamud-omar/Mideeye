import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    userName: {
      type: String,
      required: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [1000, 'Review cannot exceed 1000 characters']
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Prevent multiple reviews per book by same user
reviewSchema.index({ bookId: 1, userId: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
