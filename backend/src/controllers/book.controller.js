import { Book } from '../models/Book.js';

export const getBooks = async (req, res, next) => {
  try {
    const {
      search,
      category,
      author,
      minPrice,
      maxPrice,
      minRating,
      inStockOnly,
      featured,
      isBestSeller,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const query = { status: 'ACTIVE' };

    // Text or Regex Search
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { category: searchRegex },
        { isbn: searchRegex },
        { description: searchRegex }
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = new RegExp(`^${category.trim()}$`, 'i');
    }

    // Author filter
    if (author) {
      query.author = new RegExp(author.trim(), 'i');
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // In stock filter
    if (inStockOnly === 'true') {
      query.stock = { $gt: 0 };
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (isBestSeller === 'true') {
      query.isBestSeller = true;
    }

    // Sorting definition
    let sortCriteria = { createdAt: -1 }; // default newest
    if (sort === 'oldest') {
      sortCriteria = { createdAt: 1 };
    } else if (sort === 'price-low') {
      sortCriteria = { price: 1 };
    } else if (sort === 'price-high') {
      sortCriteria = { price: -1 };
    } else if (sort === 'rating') {
      sortCriteria = { rating: -1, totalReviews: -1 };
    } else if (sort === 'bestselling') {
      sortCriteria = { totalSold: -1, rating: -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const totalBooks = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(totalBooks / limitNum);

    res.json({
      success: true,
      data: books,
      pagination: {
        totalBooks,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedBooks = async (req, res, next) => {
  try {
    const books = await Book.find({ status: 'ACTIVE', featured: true })
      .sort({ rating: -1, totalSold: -1 })
      .limit(8);

    res.json({
      success: true,
      data: books
    });
  } catch (error) {
    next(error);
  }
};

export const getBestSellers = async (req, res, next) => {
  try {
    const books = await Book.find({ status: 'ACTIVE' })
      .sort({ totalSold: -1, rating: -1 })
      .limit(8);

    res.json({
      success: true,
      data: books
    });
  } catch (error) {
    next(error);
  }
};

export const getNewArrivals = async (req, res, next) => {
  try {
    const books = await Book.find({ status: 'ACTIVE' })
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({
      success: true,
      data: books
    });
  } catch (error) {
    next(error);
  }
};

export const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
        errorCode: 'BOOK_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};

export const getRelatedBooks = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentBook = await Book.findById(id);

    if (!currentBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const related = await Book.find({
      _id: { $ne: currentBook._id },
      status: 'ACTIVE',
      $or: [
        { category: currentBook.category },
        { author: currentBook.author }
      ]
    })
      .sort({ rating: -1, totalSold: -1 })
      .limit(4);

    res.json({
      success: true,
      data: related
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: Create Book
export const createBook = async (req, res, next) => {
  try {
    const {
      title,
      description,
      author,
      category,
      isbn,
      publisher,
      publicationDate,
      pages,
      language,
      price,
      discountPrice,
      stock,
      coverImage,
      featured,
      isBestSeller
    } = req.body;

    const existingIsbn = await Book.findOne({ isbn });
    if (existingIsbn) {
      return res.status(400).json({
        success: false,
        message: 'A book with this ISBN already exists.',
        errorCode: 'DUPLICATE_ISBN'
      });
    }

    const book = await Book.create({
      title,
      description,
      author,
      category,
      isbn,
      publisher,
      publicationDate: publicationDate || Date.now(),
      pages: Number(pages),
      language: language || 'English',
      price: Number(price),
      discountPrice: Number(discountPrice) || 0,
      stock: Number(stock) || 0,
      coverImage,
      featured: Boolean(featured),
      isBestSeller: Boolean(isBestSeller)
    });

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: Update Book
export const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.isbn) {
      const existingIsbn = await Book.findOne({
        isbn: updateData.isbn,
        _id: { $ne: id }
      });
      if (existingIsbn) {
        return res.status(400).json({
          success: false,
          message: 'Another book with this ISBN already exists.',
          errorCode: 'DUPLICATE_ISBN'
        });
      }
    }

    const book = await Book.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: book
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: Delete Book (or soft delete)
export const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await Book.findByIdAndDelete(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
