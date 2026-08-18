import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Zap,
  Truck,
  ArrowLeft
} from 'lucide-react';
import {
  selectCartItems,
  selectCartSubtotal,
  selectDeliveryFee,
  selectCartTotal,
  updateQuantity,
  removeFromCart,
  clearCart
} from '../store/slices/cartSlice';

export default function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const deliveryFee = useSelector(selectDeliveryFee);
  const total = useSelector(selectCartTotal);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 font-serif">
          Your Shopping Cart is Empty
        </h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Looks like you haven't added any books to your cart yet. Explore our bestsellers and start reading today!
        </p>
        <Link
          to="/books"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition"
        >
          <span>Browse Books Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-serif">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your selected titles and proceed to secure MWallet payment
          </p>
        </div>
        <button
          onClick={() => dispatch(clearCart())}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.bookId}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              {/* Thumbnail + Title */}
              <div className="flex items-center gap-4 flex-1">
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-16 h-22 object-cover rounded-xl shadow-sm shrink-0"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop';
                  }}
                />
                <div>
                  <Link
                    to={`/books/${item.bookId}`}
                    className="font-bold text-slate-900 text-sm sm:text-base hover:text-emerald-600 transition line-clamp-2"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">{item.author}</p>
                  <span className="text-xs font-bold text-emerald-700 font-sans block mt-1">
                    ${item.effectivePrice.toFixed(2)} each
                  </span>
                </div>
              </div>

              {/* Quantity Controls & Line Total */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0 border-slate-100">
                {/* Quantity buttons */}
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    onClick={() =>
                      dispatch(
                        updateQuantity({
                          bookId: item.bookId,
                          quantity: item.quantity - 1
                        })
                      )
                    }
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-slate-900 bg-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      dispatch(
                        updateQuantity({
                          bookId: item.bookId,
                          quantity: item.quantity + 1
                        })
                      )
                    }
                    disabled={item.quantity >= item.stock}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 disabled:opacity-30 font-bold text-sm"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <span className="text-base font-black text-slate-900 font-sans w-20 text-right">
                  ${item.subtotal.toFixed(2)}
                </span>

                {/* Remove button */}
                <button
                  onClick={() => dispatch(removeFromCart(item.bookId))}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                  title="Remove from cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Link
              to="/books"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Right: Order Calculation Summary */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 sticky top-24">
          <h3 className="text-lg font-bold text-slate-900 font-serif pb-3 border-b border-slate-100">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                Estimated Delivery
              </span>
              <span className="font-bold text-slate-900">
                {deliveryFee === 0 ? (
                  <span className="text-emerald-600 uppercase font-extrabold">FREE</span>
                ) : (
                  `$${deliveryFee.toFixed(2)}`
                )}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax</span>
              <span className="font-bold text-slate-900">$0.00</span>
            </div>

            {subtotal < 50 && (
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-800 text-[11px]">
                Add <span className="font-bold">${(50 - subtotal).toFixed(2)}</span> more to qualify for <strong>FREE DELIVERY</strong>!
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Total Amount</span>
              <span className="text-2xl font-black text-slate-900 font-sans">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Payment Trust Badge */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            <span>MWallet Direct Purchase Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
