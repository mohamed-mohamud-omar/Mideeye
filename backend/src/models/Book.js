import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Book description is required'],
      trim: true
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      index: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true
    },
    categoryRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
      index: true
    },
    publisher: {
      type: String,
      required: [true, 'Publisher is required'],
      trim: true
    },
    publicationDate: {
      type: Date,
      default: Date.now
    },
    pages: {
      type: Number,
      required: [true, 'Number of pages is required'],
      min: [1, 'Pages must be at least 1']
    },
    language: {
      type: String,
      default: 'English'
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: [0, 'Discount price cannot be negative']
    },
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image URL is required']
    },
    rating: {
      type: Number,
      default: 5.0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5']
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    totalSold: {
      type: Number,
      default: 0
    },
    featured: {
      type: Boolean,
      default: false
    },
    isBestSeller: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE'
    }
  },
  { timestamps: true }
);

// Compound text index for fast full-text searching
bookSchema.index({
  title: 'text',
  description: 'text',
  author: 'text',
  category: 'text',
  isbn: 'text'
});

export const Book = mongoose.model('Book', bookSchema);
