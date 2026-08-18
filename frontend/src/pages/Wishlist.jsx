import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { fetchWishlist, toggleWishlistAsync } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import { showToast } from '../store/slices/toastSlice';

export default function Wishlist() {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const handleMoveToCart = (book) => {
    dispatch(addToCart({ book, quantity: 1 }));
    dispatch(toggleWishlistAsync(book._id || book.id));
    dispatch(showToast(`Moved "${book.title}" to cart!`, 'success'));
  };

  const handleRemove = (bookId) => {
    dispatch(toggleWishlistAsync(bookId));
    dispatch(showToast('Removed from wishlist', 'success'));
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Heart className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">Your Wishlist</h2>
        <p className="text-xs text-slate-500">Please log in to view and manage your saved books.</p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-serif">
          Saved Wishlist ({items.length})
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Keep track of books you want to read or buy later
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <Heart className="w-16 h-16 text-slate-300 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900">Your wishlist is empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our books catalog and click the heart icon on any title to save it for later.
          </p>
          <Link
            to="/books"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition"
          >
            <span>Explore Books</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((book) => {
            const isDiscounted = book.discountPrice > 0 && book.discountPrice < book.price;
            const effectivePrice = isDiscounted ? book.discountPrice : book.price;

            return (
              <div
                key={book._id || book.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition p-4 flex flex-col justify-between"
              >
                <div>
                  <Link to={`/books/${book._id || book.id}`} className="block aspect-[3/4] overflow-hidden rounded-xl bg-slate-100 mb-3">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                  </Link>

                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {book.category}
                  </span>

                  <Link
                    to={`/books/${book._id || book.id}`}
                    className="font-bold text-slate-900 text-sm hover:text-emerald-600 block mt-1 line-clamp-2"
                  >
                    {book.title}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">{book.author}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-black text-slate-900 font-sans text-base">
                    ${effectivePrice.toFixed(2)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleRemove(book._id || book.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveToCart(book)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Move to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
