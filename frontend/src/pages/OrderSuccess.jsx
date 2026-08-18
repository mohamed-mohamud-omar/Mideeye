import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Printer,
  Package,
  ArrowRight,
  Zap,
  Building2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${orderId}`);
        if (res.data.success) {
          setOrder(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load order receipt:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handlePrintReceipt = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
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
          View All Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Congratulation Banner (hidden when printing) */}
      <div className="no-print bg-emerald-900 text-white p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <span className="inline-block px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-md uppercase mb-1">
              PAYMENT VERIFIED & APPROVED
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">
              Thank You for Your Order!
            </h1>
            <p className="text-xs text-emerald-200 mt-1 font-light">
              Your MWallet transaction was confirmed and inventory has been reserved.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handlePrintReceipt}
            className="px-5 py-2.5 bg-white text-slate-900 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>Print Receipt</span>
          </button>
          <Link
            to="/orders"
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span>My Orders</span>
          </Link>
        </div>
      </div>

      {/* Printable Receipt Card */}
      <div
        id="printable-receipt"
        className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8 text-slate-800"
      >
        {/* Receipt Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                BV
              </div>
              <h2 className="text-2xl font-black text-slate-900 font-serif">
                Book<span className="text-emerald-600">Verse</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">Official Payment Invoice & Order Confirmation</p>
            <p className="text-xs text-slate-400">Maka Al Mukarama St, Mogadishu • support@bookverse.example.com</p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
              ORDER {order.orderStatus}
            </span>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Invoice: <strong className="text-slate-900">{order.invoiceId}</strong>
            </p>
            <p className="text-xs text-slate-500 font-mono">
              Ref: <strong className="text-slate-900">{order.paymentReference}</strong>
            </p>
            <p className="text-xs text-slate-400">
              Date: {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Customer & Delivery Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
          <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-emerald-700">
              Customer Information
            </h4>
            <p className="text-sm font-bold text-slate-900">{order.shippingAddress.fullName}</p>
            <p className="text-slate-600">{order.shippingAddress.email}</p>
            <p className="text-slate-600">{order.shippingAddress.phone}</p>
          </div>

          <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-emerald-700">
              Shipping & Delivery
            </h4>
            <p className="text-slate-700 font-medium">
              {order.shippingAddress.street}, {order.shippingAddress.district ? `${order.shippingAddress.district}, ` : ''}{order.shippingAddress.city}
            </p>
            {order.shippingAddress.notes && (
              <p className="text-slate-500 italic mt-1">Notes: "{order.shippingAddress.notes}"</p>
            )}
          </div>
        </div>

        {/* Itemized Table */}
        <div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="py-3 font-bold">Book Title</th>
                <th className="py-3 font-bold text-center">Unit Price</th>
                <th className="py-3 font-bold text-center">Quantity</th>
                <th className="py-3 font-bold text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 pr-4">
                    <span className="font-bold text-slate-900 block text-sm">{item.title}</span>
                    <span className="text-slate-400 text-[11px]">{item.author}</span>
                  </td>
                  <td className="py-3 text-center font-sans text-slate-700">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="py-3 text-center font-semibold text-slate-900">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right font-black text-slate-900 font-sans">
                    ${item.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Totals & Payment Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-slate-200 items-start">
          {/* MWallet Transaction Summary */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>MWallet Payment Method</span>
            </div>
            <p className="text-slate-600">
              Account Charged: <span className="font-mono font-bold text-slate-900">{order.payerAccount}</span>
            </p>
            <p className="text-slate-600">
              Status: <span className="font-bold text-emerald-700">{order.paymentStatus}</span>
            </p>
            <p className="text-slate-500 text-[11px]">
              Processed via official MWallet API_PURCHASE gateway protocol.
            </p>
          </div>

          {/* Totals Breakdown */}
          <div className="space-y-2 text-xs text-slate-600 sm:text-right">
            <div className="flex justify-between sm:justify-end sm:gap-12">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-900">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between sm:justify-end sm:gap-12">
              <span>Delivery Fee:</span>
              <span className="font-bold text-slate-900">
                {order.deliveryFee === 0 ? 'FREE ($0.00)' : `$${order.deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between sm:justify-end sm:gap-12">
              <span>Tax:</span>
              <span className="font-bold text-slate-900">$0.00</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between sm:justify-end sm:gap-12 items-baseline text-slate-900">
              <span className="text-sm font-bold">Total Paid:</span>
              <span className="text-2xl font-black font-sans text-emerald-700">
                ${order.total.toFixed(2)} USD
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="border-t border-slate-100 pt-6 text-center text-slate-400 text-[11px]">
          Thank you for choosing BookVerse Store. For any inquiries regarding this order, please quote Invoice #{order.invoiceId}.
        </div>
      </div>

      {/* Bottom CTA (hidden on print) */}
      <div className="no-print text-center pt-4">
        <Link
          to="/books"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
