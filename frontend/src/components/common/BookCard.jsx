import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Star, Heart, Check } from 'lucide-react';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlistAsync } from '../../store/slices/wishlistSlice';
import { showToast } from '../../store/slices/toastSlice';

export default function BookCard({ book }) {
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist.items);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const isSaved = wishlist.some((b) => (b._id || b.id) === (book._id || book.id));
  const isOutOfStock = book.stock <= 0;
  const isDiscounted = book.discountPrice > 0 && book.price > 0 && book.discountPrice < book.price;
  const effectivePrice = isDiscounted ? book.discountPrice : book.price;
  const discountPercent = isDiscounted && book.price > 0
    ? Math.round(((book.price - book.discountPrice) / book.price) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    dispatch(addToCart({ book, quantity: 1 }));
    dispatch(showToast(`Added "${book.title}" to your cart!`, 'success'));
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      dispatch(showToast('Please log in to save books to your wishlist', 'info'));
      return;
    }
    dispatch(toggleWishlistAsync(book._id || book.id));
    dispatch(
      showToast(
        isSaved ? `Removed from wishlist` : `Added "${book.title}" to wishlist`,
        'success'
      )
    );
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Cover Image & Badges Container */}
      <Link
        to={`/books/${book._id || book.id}`}
        className="relative block aspect-[3/4] overflow-hidden bg-slate-100"
      >
        <img
          src={book.coverImage}
          alt={book.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop';
          }}
        />

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {isDiscounted && (
            <span className="px-2 py-0.5 text-[11px] font-extrabold bg-rose-600 text-white rounded-md shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {book.isBestSeller && (
            <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-500 text-white rounded-md shadow-sm">
              Best Seller
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label="Save to Wishlist"
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all shadow-sm z-10 ${
            isSaved
              ? 'bg-rose-50 text-rose-500 shadow-rose-200'
              : 'bg-white/80 text-slate-500 hover:text-rose-500 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Stock Alert Overlay if Out of Stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1 bg-rose-600 text-white font-bold text-xs rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Book Metadata Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
              {book.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{book.rating ? book.rating.toFixed(1) : '5.0'}</span>
              <span className="text-slate-400 text-[10px]">({book.totalReviews || 0})</span>
            </div>
          </div>

          {/* Title */}
          <Link
            to={`/books/${book._id || book.id}`}
            className="block font-bold text-slate-900 text-base line-clamp-2 hover:text-emerald-600 transition-colors leading-snug"
            title={book.title}
          >
            {book.title}
          </Link>

          {/* Author */}
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            by <span className="text-slate-700 font-medium">{book.author}</span>
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900 font-sans">
                ${effectivePrice.toFixed(2)}
              </span>
              {isDiscounted && (
                <span className="text-xs text-slate-400 line-through">
                  ${book.price.toFixed(2)}
                </span>
              )}
            </div>
            {book.stock > 0 && book.stock <= 5 && (
              <span className="text-[10px] text-amber-600 font-semibold block">
                Only {book.stock} left!
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-sm shadow-emerald-600/30'
            }`}
            title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
