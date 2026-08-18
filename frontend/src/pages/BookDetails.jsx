import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Star,
  ShoppingCart,
  Heart,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  BookOpen,
  Calendar,
  Globe,
  Layers,
  Building2,
  Barcode,
  CheckCircle2,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlistAsync } from '../store/slices/wishlistSlice';
import { showToast } from '../store/slices/toastSlice';
import BookCard from '../components/common/BookCard';

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const wishlist = useSelector((state) => state.wishlist.items);

  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const isSaved = wishlist.some((b) => (b._id || b.id) === (book?._id || book?.id));

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        setLoading(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const [bookRes, relatedRes, reviewsRes] = await Promise.all([
          api.get(`/books/${id}`),
          api.get(`/books/${id}/related`),
          api.get(`/reviews/book/${id}`)
        ]);

        if (bookRes.data.success) {
          setBook(bookRes.data.data);
          setQuantity(1);
        }
        if (relatedRes.data.success) {
          setRelatedBooks(relatedRes.data.data);
        }
        if (reviewsRes.data.success) {
          setReviews(reviewsRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching book details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Book Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The requested book could not be located.</p>
        <Link
          to="/books"
          className="mt-4 inline-block px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm"
        >
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isDiscounted = book.discountPrice > 0 && book.price > 0 && book.discountPrice < book.price;
  const effectivePrice = isDiscounted ? book.discountPrice : book.price;
  const discountPercent = isDiscounted && book.price > 0
    ? Math.round(((book.price - book.discountPrice) / book.price) * 100)
    : 0;
  const isOutOfStock = book.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    dispatch(addToCart({ book, quantity }));
    dispatch(showToast(`Added ${quantity} x "${book.title}" to cart!`, 'success'));
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    dispatch(addToCart({ book, quantity }));
    navigate('/checkout');
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      dispatch(showToast('Please log in to save books to your wishlist', 'info'));
      return;
    }
    dispatch(toggleWishlistAsync(book._id));
    dispatch(
      showToast(
        isSaved ? 'Removed from wishlist' : `Saved "${book.title}" to wishlist`,
        'success'
      )
    );
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      dispatch(showToast('Please log in to write a review', 'info'));
      return;
    }
    if (!comment.trim()) {
      setReviewError('Please provide a comment for your review.');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError('');
      const res = await api.post(`/reviews/book/${book._id}`, {
        rating,
        comment: comment.trim()
      });

      if (res.data.success) {
        dispatch(showToast('Review submitted successfully!', 'success'));
        setReviews([res.data.data, ...reviews]);
        setComment('');
        // Refresh book rating
        const updatedBook = await api.get(`/books/${book._id}`);
        if (updatedBook.data.success) setBook(updatedBook.data.data);
      }
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review. Verified purchase required.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link to="/" className="hover:text-slate-700 transition">Home</Link>
        <span>/</span>
        <Link to="/books" className="hover:text-slate-700 transition">Books</Link>
        <span>/</span>
        <Link to={`/books?category=${encodeURIComponent(book.category)}`} className="hover:text-slate-700 transition">
          {book.category}
        </Link>
        <span>/</span>
        <span className="text-slate-700 truncate max-w-xs">{book.title}</span>
      </nav>

      {/* Main Book Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Book Cover Showcase */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-md bg-white p-6 rounded-3xl border border-slate-200 shadow-xl">
            <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-slate-100 relative shadow-inner">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop';
                }}
              />
              {isDiscounted && (
                <span className="absolute top-3 left-3 px-3 py-1 bg-rose-600 text-white text-xs font-black rounded-lg shadow-md">
                  SAVE {discountPercent}%
                </span>
              )}
            </div>

            {/* Guarantees Bar */}
            <div className="grid grid-cols-3 gap-2 mt-6 text-center text-[11px] text-slate-500 border-t border-slate-100 pt-4">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Express Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>MWallet Verified</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <span>Original Copy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Book Details & Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                {book.category}
              </span>
              {book.isBestSeller && (
                <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">
                  ★ Best Seller
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-serif mt-3 leading-tight">
              {book.title}
            </h1>

            <p className="text-base text-slate-600 mt-2 font-medium">
              Written by <span className="text-slate-900 font-bold">{book.author}</span>
            </p>

            {/* Rating & Sold count */}
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{book.rating ? book.rating.toFixed(1) : '5.0'}</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">{book.totalReviews || 0} customer reviews</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">{book.totalSold || 0} copies sold</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900 font-sans">
                  ${effectivePrice.toFixed(2)}
                </span>
                {isDiscounted && (
                  <span className="text-base text-slate-400 line-through">
                    ${book.price.toFixed(2)}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                Prices include all local retail taxes
              </span>
            </div>

            {/* Stock Tag */}
            <div className="text-right">
              {book.stock > 0 ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>In Stock ({book.stock} left)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Out of Stock</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              About This Book
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-light">
              {book.description}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Barcode className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">ISBN</span>
                <span className="font-semibold">{book.isbn}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-600">
              <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Publisher</span>
                <span className="font-semibold truncate">{book.publisher}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-600">
              <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Pages</span>
                <span className="font-semibold">{book.pages} pages</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-600">
              <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Language</span>
                <span className="font-semibold">{book.language || 'English'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Published</span>
                <span className="font-semibold">
                  {new Date(book.publicationDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-600">
              <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Format</span>
                <span className="font-semibold">Paperback / Hardcover</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-4">
            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-sm font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(book.stock, q + 1))}
                    disabled={quantity >= book.stock}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 min-w-[160px] py-3.5 px-6 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-bold text-sm transition shadow flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 min-w-[160px] py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-bold text-sm transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Now (MWallet)</span>
              </button>

              <button
                onClick={handleToggleWishlist}
                className={`p-3.5 rounded-2xl border transition ${
                  isSaved
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 font-serif">
              Customer Reviews ({reviews.length})
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Read feedback from readers who bought this edition
            </p>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200/50">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="text-lg font-black text-amber-900">
              {book.rating ? book.rating.toFixed(1) : '5.0'}
            </span>
            <span className="text-xs text-amber-700 font-semibold">/ 5.0 Rating</span>
          </div>
        </div>

        {/* Submit Review Form */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/70">
          <h4 className="font-bold text-slate-900 text-sm mb-3">
            Write a Verified Customer Review
          </h4>

          {reviewError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{reviewError}</span>
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Your Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts on this book's content, quality, and takeaways..."
                rows={3}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition"
            >
              {submittingReview ? 'Posting Review...' : 'Submit Review'}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              No reviews yet for this title. Be the first to leave a review!
            </p>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-4 bg-white border border-slate-100 rounded-2xl space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {rev.userName}
                    </span>
                    {rev.isVerifiedPurchase && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-light">
                  {rev.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Books Section */}
      {relatedBooks.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-2xl font-extrabold text-slate-900 font-serif">
            You Might Also Like
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedBooks.map((relBook) => (
              <BookCard key={relBook._id} book={relBook} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
