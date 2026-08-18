import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Shield, Zap, Phone, Mail, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-20 no-print">
      {/* Top Value Badges */}
      <div className="border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base">Instant MWallet Pay</h4>
                <p className="text-xs text-slate-400 mt-0.5">Secure, real-time wallet transactions in seconds.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base">Verified Books</h4>
                <p className="text-xs text-slate-400 mt-0.5">100% authentic, high quality original publications.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base">Dedicated Support</h4>
                <p className="text-xs text-slate-400 mt-0.5">Fast customer assistance for orders & delivery.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white font-serif">
                Book<span className="text-emerald-400">Verse</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Your premier online bookstore delivering best-selling books, technical guides, self-development literature, and novels straight to your doorstep with instantaneous MWallet payments.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Maka Al Mukarama St, Mogadishu, Somalia</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@bookverse.example.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+252 61 500 0000</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-white font-bold text-sm mb-3.5">Explore</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/books" className="hover:text-emerald-400 transition">All Books Catalog</Link></li>
              <li><Link to="/books?featured=true" className="hover:text-emerald-400 transition">Featured Books</Link></li>
              <li><Link to="/books?isBestSeller=true" className="hover:text-emerald-400 transition">Best Sellers</Link></li>
              <li><Link to="/books?sort=newest" className="hover:text-emerald-400 transition">New Arrivals</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h5 className="text-white font-bold text-sm mb-3.5">Top Categories</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/books?category=Technology" className="hover:text-emerald-400 transition">Technology & AI</Link></li>
              <li><Link to="/books?category=Programming" className="hover:text-emerald-400 transition">Programming</Link></li>
              <li><Link to="/books?category=Business" className="hover:text-emerald-400 transition">Business & Finance</Link></li>
              <li><Link to="/books?category=Self%20Development" className="hover:text-emerald-400 transition">Self Development</Link></li>
              <li><Link to="/books?category=Fiction" className="hover:text-emerald-400 transition">Fiction & Novels</Link></li>
            </ul>
          </div>

          {/* Customer & Policy */}
          <div>
            <h5 className="text-white font-bold text-sm mb-3.5">Account & Support</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/orders" className="hover:text-emerald-400 transition">Track Your Order</Link></li>
              <li><Link to="/wishlist" className="hover:text-emerald-400 transition">My Saved Wishlist</Link></li>
              <li><Link to="/profile" className="hover:text-emerald-400 transition">Customer Profile</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition">About Our Store</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-400 transition">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/80 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BookVerse Store. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-semibold text-[11px] border border-slate-700">
              MWallet Enabled
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-semibold text-[11px] border border-slate-700">
              256-Bit SSL Encrypted
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
