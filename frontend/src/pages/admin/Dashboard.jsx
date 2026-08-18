import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Package,
  BookOpen,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import api from '../../services/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { metrics, charts, topBooks, recentOrders } = data || {
    metrics: {},
    charts: { monthlySales: [], categorySales: [] },
    topBooks: [],
    recentOrders: []
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-serif">
            Store Performance Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time sales revenue, inventory health, and MWallet transaction statistics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            MWallet Gateway Active
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 font-sans block">
            ${metrics.totalRevenue?.toFixed(2) || '0.00'}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            From {metrics.paidOrders || 0} confirmed paid orders
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 font-sans block">
            {metrics.totalOrders || 0}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {metrics.paidOrders || 0} Paid • {metrics.pendingPayments || 0} Pending
          </span>
        </div>

        {/* Total Books */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Catalog Books</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 font-sans block">
            {metrics.totalBooks || 0}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            Across 9 active genre categories
          </span>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Inventory Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 font-sans block">
            {(metrics.lowStockBooks || 0) + (metrics.outOfStockBooks || 0)}
          </span>
          <span className="text-[11px] text-amber-600 font-semibold">
            {metrics.lowStockBooks || 0} Low Stock • {metrics.outOfStockBooks || 0} Out of Stock
          </span>
        </div>
      </div>

      {/* Analytics Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Category Sales Distribution */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Revenue by Category</h3>
          
          <div className="space-y-3">
            {charts.categorySales?.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No completed category sales data yet.</p>
            ) : (
              charts.categorySales.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-800">{cat.category}</span>
                  <div className="text-right">
                    <span className="font-black text-slate-900 block font-sans">${cat.totalAmount.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400">{cat.quantity} books sold</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Selling Books */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Top Selling Titles</h3>

          <div className="space-y-3">
            {topBooks.map((book) => (
              <div key={book._id} className="flex items-center justify-between gap-3 text-xs p-2.5 hover:bg-slate-50 rounded-xl transition">
                <div className="flex items-center gap-3 truncate">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-8 h-11 object-cover rounded-lg shadow-sm shrink-0"
                  />
                  <div className="truncate">
                    <h5 className="font-bold text-slate-800 truncate">{book.title}</h5>
                    <p className="text-[10px] text-slate-400">{book.author}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-emerald-700 block">{book.totalSold || 0} sold</span>
                  <span className="text-[10px] text-slate-400 font-medium">{book.stock} in stock</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">Recent Orders & Transactions</h3>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                <th className="pb-3">Invoice</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Payment Ref</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Order Status</th>
                <th className="pb-3">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50 transition">
                  <td className="py-3 font-mono font-bold text-slate-900">{order.invoiceId}</td>
                  <td className="py-3">
                    <span className="font-bold text-slate-800 block">{order.shippingAddress?.fullName}</span>
                    <span className="text-[10px] text-slate-400">{order.payerAccount}</span>
                  </td>
                  <td className="py-3 font-mono text-[11px] text-slate-500">{order.paymentReference}</td>
                  <td className="py-3 font-black text-slate-900 font-sans">${order.total.toFixed(2)}</td>
                  <td className="py-3">
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-bold rounded-md">
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md ${
                        order.paymentStatus === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
