import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  Printer,
  ArrowLeft,
  XCircle,
  Zap,
  MapPin,
  User,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import { useDispatch } from 'react-redux';
import { showToast } from '../store/slices/toastSlice';

export default function OrderDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) {
      return;
    }
    try {
      setCancelling(true);
      const res = await api.post(`/orders/${id}/cancel`);
      if (res.data.success) {
        dispatch(showToast('Order cancelled successfully', 'success'));
        fetchOrder();
      }
    } catch (err) {
      dispatch(showToast(err.message || 'Failed to cancel order', 'error'));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Order Not Found</h2>
        <Link
          to="/orders"
          className="inline-block px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const steps = [
    { label: 'Order Placed', status: 'PENDING_PAYMENT' },
    { label: 'Payment Confirmed', status: 'PAID' },
    { label: 'Processing & Packed', status: 'PROCESSING' },
    { label: 'Ready for Dispatch', status: 'READY' },
    { label: 'Shipped with Courier', status: 'SHIPPED' },
    { label: 'Delivered', status: 'DELIVERED' }
  ];

  const getStepIndex = (currentStatus) => {
    if (currentStatus === 'CANCELLED') return -1;
    switch (currentStatus) {
      case 'PENDING_PAYMENT':
        return 0;
      case 'PAID':
        return 1;
      case 'PROCESSING':
        return 2;
      case 'READY':
        return 3;
      case 'SHIPPED':
        return 4;
      case 'DELIVERED':
        return 5;
      default:
        return 1;
    }
  };

  const activeStepIdx = getStepIndex(order.orderStatus);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Orders</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 font-serif">
              Order #{order.invoiceId}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()} • Ref: <strong className="font-mono text-slate-700">{order.paymentReference}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/order-success/${order._id}`}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-600" />
              <span>Print Receipt</span>
            </Link>

            {['PENDING_PAYMENT', 'PAID', 'PROCESSING'].includes(order.orderStatus) && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Visual Timeline Tracker */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="font-bold text-slate-900 text-sm">Order Status Progression</h3>

        {order.orderStatus === 'CANCELLED' ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <strong className="block font-bold">This order was cancelled.</strong>
              <span>Any reserved inventory was returned to available stock.</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-2">
            {steps.map((s, idx) => {
              const isCompleted = idx <= activeStepIdx;
              const isCurrent = idx === activeStepIdx;

              return (
                <div key={s.status} className="flex flex-col items-center text-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] leading-tight ${
                      isCurrent
                        ? 'font-extrabold text-emerald-700'
                        : isCompleted
                        ? 'font-bold text-slate-800'
                        : 'text-slate-400 font-medium'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Items Snapshot List */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100">
            Items in this Order ({order.items.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-14 h-20 object-cover rounded-xl shadow-sm shrink-0"
                  />
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</h5>
                    <p className="text-xs text-slate-500">{item.author}</p>
                    <p className="text-xs font-semibold text-slate-700 mt-1">
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <span className="font-black text-slate-900 font-sans text-base">
                  ${item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Shipping & Payment Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Shipping */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Delivery Details</span>
            </h4>
            <p className="font-bold text-slate-900 text-sm">{order.shippingAddress.fullName}</p>
            <p className="text-slate-600">{order.shippingAddress.phone}</p>
            <p className="text-slate-600">
              {order.shippingAddress.street}, {order.shippingAddress.city}
            </p>
          </div>

          {/* Payment */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Payment Details</span>
            </h4>
            <div className="space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-bold text-slate-900">MWallet Direct</span>
              </div>
              <div className="flex justify-between">
                <span>Account:</span>
                <span className="font-mono font-bold text-slate-900">{order.payerAccount}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="font-bold text-emerald-700">{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 items-baseline text-slate-900">
                <span className="font-bold text-sm">Total Paid:</span>
                <span className="font-black text-xl font-sans">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
