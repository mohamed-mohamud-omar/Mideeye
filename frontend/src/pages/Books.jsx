import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  BookOpen
} from 'lucide-react';
import api from '../services/api';
import BookCard from '../components/common/BookCard';
import { SkeletonCard } from '../components/common/ProtectedRoute';

export default function Books() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStockOnly') === 'true');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Catalog Data
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    totalBooks: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 12
  });
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync state with URL params when URL changes
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || 'All');
    setSort(searchParams.get('sort') || 'newest');
    setPage(parseInt(searchParams.get('page') || '1', 10));
  }, [searchParams]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Books from backend with filters
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (search.trim()) params.append('search', search.trim());
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
      if (sort) params.append('sort', sort);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minRating) params.append('minRating', minRating);
      if (inStockOnly) params.append('inStockOnly', 'true');
      if (searchParams.get('featured') === 'true') params.append('featured', 'true');
      if (searchParams.get('isBestSeller') === 'true') params.append('isBestSeller', 'true');
      params.append('page', page);
      params.append('limit', 12);

      const res = await api.get(`/books?${params.toString()}`);
      if (res.data.success) {
        setBooks(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [search, selectedCategory, sort, minPrice, maxPrice, minRating, inStockOnly, page, searchParams]);

  const handleApplySearch = (e) => {
    e.preventDefault();
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (search.trim()) newParams.set('search', search.trim());
    else newParams.delete('search');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleCategoryChange = (catName) => {
    setSelectedCategory(catName);
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (catName !== 'All') newParams.set('category', catName);
    else newParams.delete('category');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', newSort);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSort('newest');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setInStockOnly(false);
    setPage(1);
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Search Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/30">
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Explore Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif">
            Browse All Books
          </h1>
          <p className="text-sm text-slate-300 font-light">
            Search across our collection of software engineering, science, business, fiction, and personal growth titles.
          </p>

          {/* Search Input Bar */}
          <form onSubmit={handleApplySearch} className="pt-2 flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, author, category, or ISBN..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/20 transition"
              />
              <Search className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-2xl transition shadow-md"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit sticky top-24">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Filters</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-400 hover:text-emerald-600 flex items-center gap-1 font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Categories Filter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Category
            </h4>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              <button
                onClick={() => handleCategoryChange('All')}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-sm font-medium transition ${
                  selectedCategory === 'All'
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id || cat.slug}
                  onClick={() => handleCategoryChange(cat.name)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-sm font-medium transition ${
                    selectedCategory === cat.name
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.bookCount !== undefined && (
                    <span className="text-xs text-slate-400">({cat.bookCount})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Price Range ($)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Min Rating */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Rating
            </h4>
            <div className="space-y-1">
              {[4, 3, 2].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(minRating === r.toString() ? '' : r.toString())}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    minRating === r.toString()
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>★ {r} Stars & Above</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stock Filter Checkbox */}
          <div className="pt-4 border-t border-slate-100">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Book Grid & Sorting Controls */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Bar: Results Count & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-sm text-slate-500">
              Showing <span className="font-bold text-slate-900">{books.length}</span> of{' '}
              <span className="font-bold text-slate-900">{pagination.totalBooks}</span> books
              {selectedCategory !== 'All' && (
                <span className="ml-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-xs font-semibold">
                  {selectedCategory}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400">Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="oldest">Oldest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Best Rated</option>
                  <option value="bestselling">Best Selling</option>
                </select>
              </div>
            </div>
          </div>

          {/* Book Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <SkeletonCard key={n} />
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No books found</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                We couldn't find any books matching your selected filters or search keyword. Try clearing some filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {books.map((book) => (
                <BookCard key={book._id || book.id} book={book} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={!pagination.hasPrevPage}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => handlePageChange(num)}
                  className={`w-10 h-10 rounded-xl text-xs font-bold transition ${
                    num === page
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {num}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={!pagination.hasNextPage}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm lg:hidden">
          <div className="w-full max-w-xs bg-white h-full p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Filters</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase">Categories</h4>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    handleCategoryChange('All');
                    setIsMobileFilterOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${
                    selectedCategory === 'All' ? 'bg-emerald-50 text-emerald-700 font-bold' : ''
                  }`}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id || c.slug}
                    onClick={() => {
                      handleCategoryChange(c.name);
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${
                      selectedCategory === c.name ? 'bg-emerald-50 text-emerald-700 font-bold' : ''
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  handleResetFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
