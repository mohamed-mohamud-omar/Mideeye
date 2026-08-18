import { Wishlist } from '../models/Wishlist.js';

export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user._id }).populate(
      'books'
    );

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user._id, books: [] });
    }

    res.json({
      success: true,
      data: wishlist.books
    });
  } catch (error) {
    next(error);
  }
};

export const toggleWishlist = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    let wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user._id, books: [] });
    }

    const index = wishlist.books.indexOf(bookId);
    let isAdded = false;

    if (index > -1) {
      wishlist.books.splice(index, 1);
    } else {
      wishlist.books.push(bookId);
      isAdded = true;
    }

    await wishlist.save();
    await wishlist.populate('books');

    res.json({
      success: true,
      message: isAdded ? 'Added to wishlist' : 'Removed from wishlist',
      isAdded,
      data: wishlist.books
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (wishlist) {
      wishlist.books = wishlist.books.filter((id) => id.toString() !== bookId);
      await wishlist.save();
      await wishlist.populate('books');
    }

    res.json({
      success: true,
      message: 'Item removed from wishlist',
      data: wishlist ? wishlist.books : []
    });
  } catch (error) {
    next(error);
  }
};
