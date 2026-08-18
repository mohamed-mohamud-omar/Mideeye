import React from 'react';
import { BookOpen, Shield, Zap, Heart, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
          About BookVerse
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 font-serif">
          Making Great Books Accessible to Everyone
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed font-light">
          BookVerse is built with a singular mission: empower readers with genuine books, instant digital wallet payments, and rapid home delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">MWallet Payment</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Eliminate traditional checkout friction with native MWallet mobile integration, ensuring instant confirmation in seconds.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Original Prints</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We partner with recognized global and regional publishers to ensure premium paper quality and authentic print editions.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Reader Community</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Thousands of verified reader reviews and ratings to help you find the next book that will change your life.
          </p>
        </div>
      </div>
    </div>
  );
}
