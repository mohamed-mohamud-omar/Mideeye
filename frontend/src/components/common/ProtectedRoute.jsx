import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export function ProtectedRoute({ children, adminOnly = false }) {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse flex flex-col gap-3">
      <div className="aspect-[3/4] bg-slate-200 rounded-xl w-full"></div>
      <div className="h-4 bg-slate-200 rounded w-1/3 mt-2"></div>
      <div className="h-5 bg-slate-200 rounded w-3/4"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="h-9 w-9 bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  );
}
