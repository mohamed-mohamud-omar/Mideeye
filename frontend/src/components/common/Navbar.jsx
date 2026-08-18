import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  BookOpen,
  Search,
  ShoppingCart,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { selectCartCount } from '../../store/slices/cartSlice';
import api from '../../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartCount = useSelector(selectCartCount);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const catRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    // Fetch categories for menu
    const fetchNavCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch {
        // Fallback categories if server not yet started
        setCategories([
          { name: 'Technology', slug: 'technology' },
          { name: 'Programming', slug: 'programming' },
          { name: 'Business', slug: 'business' },
          { name: 'Self Development', slug: 'self-development' },
          { name: 'Science', slug: 'science' },
          { name: 'Fiction', slug: 'fiction' }
        ]);
      }
    };
    fetchNavCategories();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (catRef.current && !catRef.current.contains(event.target)) {
        setIsCatDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCatDropdownOpen(false);
    setIsUserDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      {/* Top Notification Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              FREE SHIPPING
            </span>
            <span>Free express delivery on all orders over $50</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              MWallet Instant Pay Active
            </span>
            <Link to="/contact" className="hover:text-white transition">24/7 Support</Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1 font-serif">
                Book<span className="text-emerald-600">Verse</span>
              </span>
              <span className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase block -mt-1">
                Store & MWallet
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-2 relative">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, category, or ISBN..."
                className="w-full pl-10 pr-24 py-2 text-sm bg-slate-100/80 border border-slate-200 rounded-full focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-full transition shadow-sm"
              >
                Search
              </button>
            </div>
          </form>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 font-medium text-sm text-slate-600">
            <Link
              to="/"
              className={`hover:text-emerald-600 transition-colors ${
                isActive('/') ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              Home
            </Link>

            <Link
              to="/books"
              className={`hover:text-emerald-600 transition-colors ${
                isActive('/books') ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              All Books
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" ref={catRef}>
              <button
                onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
              >
                <span>Categories</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCatDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCatDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Browse Categories
                  </div>
                  {categories.map((cat) => (
                    <Link
                      key={cat._id || cat.slug}
                      to={`/books?category=${encodeURIComponent(cat.name)}`}
                      onClick={() => setIsCatDropdownOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      <span>{cat.name}</span>
                      {cat.bookCount !== undefined && (
                        <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 font-medium">
                          {cat.bookCount}
                        </span>
                      )}
                    </Link>
                  ))}
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <Link
                      to="/books"
                      onClick={() => setIsCatDropdownOpen(false)}
                      className="block px-3.5 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50"
                    >
                      View All Categories →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/about"
              className={`hover:text-emerald-600 transition-colors ${
                isActive('/about') ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              About
            </Link>

            <Link
              to="/contact"
              className={`hover:text-emerald-600 transition-colors ${
                isActive('/contact') ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Action Icons & User Account */}
          <div className="flex items-center gap-3">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
              title="Saved Books"
            >
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 p-2 px-3 text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-full transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">{cartCount}</span>
            </Link>

            {/* User Profile Dropdown or Login CTA */}
            {isAuthenticated ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2 pr-3 bg-slate-100 hover:bg-slate-200 rounded-full transition text-slate-800 text-sm font-medium"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate font-medium text-xs">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">
                        {user?.role} ACCOUNT
                      </span>
                    </div>

                    {user?.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/80 transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <Link
                      to="/orders"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Heart className="w-4 h-4 text-slate-400" />
                      <span>Saved Wishlist</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Account Settings</span>
                    </Link>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-semibold text-slate-700 hover:text-emerald-600 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-full shadow-sm shadow-emerald-600/20 hover:shadow transition"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (under navbar on mobile) */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books, authors, ISBN..."
              className="w-full pl-9 pr-20 py-2 text-sm bg-slate-100 border border-slate-200 rounded-full focus:bg-white focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-fade-in shadow-xl">
          <Link
            to="/"
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            to="/books"
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
          >
            Browse All Books
          </Link>
          <Link
            to="/cart"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
          >
            <span>My Cart</span>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {cartCount} items
            </span>
          </Link>
          <Link
            to="/wishlist"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
          >
            <span>Saved Wishlist</span>
            <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {wishlistItems.length}
            </span>
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/orders"
                className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
              >
                My Orders
              </Link>
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
              >
                Profile & Settings
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="block px-3 py-2 rounded-lg text-base font-semibold text-emerald-700 bg-emerald-50"
                >
                  Admin Dashboard
                </Link>
              )}
            </>
          )}
          <Link
            to="/about"
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:bg-slate-50"
          >
            About BookVerse
          </Link>
          <Link
            to="/contact"
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:bg-slate-50"
          >
            Contact & Support
          </Link>
        </div>
      )}
    </header>
  );
}
