import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  X,
  Printer,
  ShieldCheck,
  Zap
} from 'lucide-react';
import api from '../../services/api';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/slices/toastSlice';
import { Link } from 'react-router-dom';

export default function OrderManagement() {
  const dispatch = useDispatch();

  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Order Details Modal
  const [activeOrder, setActiveOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/orders?${params.toString()}`);
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, search]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      if (res.data.success) {
        dispatch(showToast(`Order status updated to ${newStatus}`, 'success'));
        fetchOrders();
        if (activeOrder && activeOrder._id === orderId) {
          setActiveOrder(res.data.data);
        }
      }
    } catch (err) {
      dispatch(showToast(err.message || 'Failed to update order status', 'error'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-100 text-emerald-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'READY':
        return 'bg-indigo-100 text-indigo-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-teal-100 text-teal-800';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-serif">
          Customer Orders Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review customer shipments, update fulfillment timelines, and inspect payment audits
        </p>
      </div>

      {/* Filters & Search Controls */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'PAID', 'PROCESSING', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedStatus === s
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice, customer, ref..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <th className="py-3.5 px-4">Invoice ID</th>
                <th className="py-3.5 px-4">Customer & Account</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Order Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {ord.invoiceId}
                      <span className="text-[10px] text-slate-400 block font-sans">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 block">{ord.shippingAddress?.fullName}</span>
                      <span className="text-[11px] font-mono text-slate-500">{ord.payerAccount}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-700">{ord.items.length} titles</span>
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900 font-sans">
                      ${ord.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          ord.paymentStatus === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold border-0 focus:ring-2 focus:ring-emerald-500 cursor-pointer ${getStatusBadge(
                          ord.orderStatus
                        )}`}
                      >
                        <option value="PAID">PAID</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="READY">READY</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setActiveOrder(ord)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                        title="View Full Order Snapshot"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">
                  Order Details #{activeOrder.invoiceId}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Ref: {activeOrder.paymentReference}
                </p>
              </div>
              <button onClick={() => setActiveOrder(null)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl">
              <div>
                <span className="font-bold text-slate-700 block uppercase text-[10px]">Customer</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{activeOrder.shippingAddress.fullName}</p>
                <p className="text-slate-500">{activeOrder.shippingAddress.email}</p>
                <p className="text-slate-500">{activeOrder.shippingAddress.phone}</p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block uppercase text-[10px]">Delivery Address</span>
                <p className="text-slate-700 mt-0.5">
                  {activeOrder.shippingAddress.street}, {activeOrder.shippingAddress.city}
                </p>
                {activeOrder.shippingAddress.notes && (
                  <p className="text-slate-400 italic">Notes: {activeOrder.shippingAddress.notes}</p>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase text-[10px]">Purchased Titles</h4>
              <div className="divide-y divide-slate-100">
                {activeOrder.items.map((item, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={item.coverImage} alt={item.title} className="w-8 h-11 object-cover rounded shadow-sm" />
                      <div>
                        <p className="font-bold text-slate-900">{item.title}</p>
                        <p className="text-[10px] text-slate-400">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 font-sans">${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financials */}
            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="font-bold text-slate-700 text-sm">Total Paid via MWallet ({activeOrder.payerAccount}):</span>
              <span className="text-xl font-black text-emerald-700 font-sans">${activeOrder.total.toFixed(2)}</span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Link
                to={`/order-success/${activeOrder._id}`}
                target="_blank"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Open Receipt</span>
              </Link>
              <button
                onClick={() => setActiveOrder(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
