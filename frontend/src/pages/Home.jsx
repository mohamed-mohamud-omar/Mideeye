import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  ShieldCheck,
  Zap,
  Star,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import BookCard from '../components/common/BookCard';
import { SkeletonCard } from '../components/common/ProtectedRoute';

export default function Home() {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [featuredRes, bestSellersRes, newArrivalsRes, categoriesRes] =
          await Promise.all([
            api.get('/books/featured'),
            api.get('/books/bestsellers'),
            api.get('/books/new-arrivals'),
            api.get('/categories')
          ]);

        if (featuredRes.data.success) setFeaturedBooks(featuredRes.data.data);
        if (bestSellersRes.data.success) setBestSellers(bestSellersRes.data.data);
        if (newArrivalsRes.data.success) setNewArrivals(newArrivalsRes.data.data);
        if (categoriesRes.data.success) setCategories(categoriesRes.data.data);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="space-y-16 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 rounded-b-3xl shadow-2xl border-b border-emerald-900/30">
        {/* Subtle decorative glow circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Small pill tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Mobile Wallet Payments</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] font-serif text-slate-100">
              Discover Your Next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
                Favorite Book
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              Browse, buy, and enjoy books from your favorite authors. Seamless checkout with instant MWallet mobile account verification and fast delivery.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/books"
                className="px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition duration-200 flex items-center gap-2"
              >
                <span>Browse Books</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/books?featured=true"
                className="px-7 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-white text-sm font-bold rounded-2xl border border-slate-700 hover:border-slate-600 transition"
              >
                Shop Now
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <span className="block text-2xl font-black text-white">100%</span>
                <span className="text-xs text-slate-400">Authentic Titles</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-emerald-400">0s</span>
                <span className="text-xs text-slate-400">MWallet Pay</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-white">4.9★</span>
                <span className="text-xs text-slate-400">Customer Rating</span>
              </div>
            </div>
          </div>

          {/* Hero Featured Visual */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-full max-w-sm">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-lg opacity-40 group-hover:opacity-75 transition duration-1000"></div>
              <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop"
                  alt="Featured bestseller book"
                  className="w-48 h-64 object-cover rounded-2xl mx-auto shadow-2xl"
                />
                <div>
                  <span className="inline-block px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[11px] font-bold rounded-md mb-1.5">
                    FEATURED BOOK OF THE WEEK
                  </span>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    Designing Data-Intensive Applications
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">by Martin Kleppmann</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="text-left">
                    <span className="text-xs text-slate-400 block">Special Price</span>
                    <span className="text-xl font-black text-emerald-400 font-sans">$42.00</span>
                  </div>
                  <Link
                    to="/books"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
              Explore Categories
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Find exactly what you love from our handpicked genre shelves
            </p>
          </div>
          <Link
            to="/books"
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
          >
            <span>All Categories</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat._id || cat.slug}
              to={`/books?category=${encodeURIComponent(cat.name)}`}
              className="group p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500 hover:shadow-lg transition-all text-center flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition duration-300">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition">
                {cat.name}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {cat.bookCount ? `${cat.bookCount} Books` : 'Explore'}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED BOOKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>Handpicked For You</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
              Featured Books
            </h2>
          </div>
          <Link
            to="/books?featured=true"
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredBooks.slice(0, 4).map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* 4. MWALLET HIGHLIGHT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-bold uppercase">
              <Zap className="w-3.5 h-3.5" />
              Direct MWallet Payment Gateway
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-serif">
              Pay Directly with Your Mobile Wallet Number
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-light">
              No credit card required. Simply enter your mobile wallet number (e.g. 2526XXXXXXXX) during checkout, confirm the prompt, and get your digital receipt instantly with verified order fulfillment.
            </p>
            <div className="pt-2">
              <Link
                to="/books"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-950 hover:bg-emerald-50 rounded-xl font-bold text-sm shadow-md transition"
              >
                <span>Start Shopping Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Trending & Popular</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
              Best Sellers
            </h2>
          </div>
          <Link
            to="/books?isBestSeller=true"
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bestSellers.slice(0, 4).map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* 6. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-500 text-xs font-bold uppercase tracking-wider mb-1">
              <Clock className="w-4 h-4" />
              <span>Fresh Off The Press</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/books?sort=newest"
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.slice(0, 4).map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
