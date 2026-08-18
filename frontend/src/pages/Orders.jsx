import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Calendar,
  Zap,
  ArrowRight,
  Printer,
  ChevronRight,
  ShoppingBag,
  Clock
} from 'lucide-react';
import api from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders/my-orders');
        if (res.data.success) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load customer orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'DELIVERED':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'PROCESSING':
      case 'READY':
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-serif">
          My Orders & Invoices
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Track fulfillment status, view payment references, and download official receipts
        </p>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No orders yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't placed any book orders yet. Browse our selection and pay easily with your mobile wallet!
          </p>
          <Link
            to="/books"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {order.invoiceId}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">
                    Ref: <strong className="font-mono text-slate-700">{order.paymentReference}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 text-[11px] font-bold rounded-full border ${getStatusBadge(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Items Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="flex flex-wrap gap-2">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs max-w-xs"
                    >
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-8 h-11 object-cover rounded-md shadow-sm shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-bold text-slate-800 truncate text-[11px]">{item.title}</p>
                        <p className="text-[10px] text-slate-500">Qty: {item.quantity} • ${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-slate-400 block">Total Paid</span>
                    <span className="text-lg font-black text-slate-900 font-sans">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/order-success/${order._id}`}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition text-xs font-bold flex items-center gap-1.5"
                      title="Print Invoice Receipt"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Receipt</span>
                    </Link>

                    <Link
                      to={`/orders/${order._id}`}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <span>Track Order</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
