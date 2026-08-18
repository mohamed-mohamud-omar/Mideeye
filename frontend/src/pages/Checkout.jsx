import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Zap,
  Lock,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Truck,
  User,
  Bell,
  X,
  Check,
  PhoneCall,
  Wifi,
  Battery,
  Signal,
  Clock
} from 'lucide-react';
import api from '../services/api';
import {
  selectCartItems,
  selectCartSubtotal,
  selectDeliveryFee,
  selectCartTotal,
  clearCart
} from '../store/slices/cartSlice';
import { showToast } from '../store/slices/toastSlice';

// ─── Phone Notification Modal ──────────────────────────────────────────────────
function PhoneConfirmModal({ amount, account, onConfirm, onDecline, isProcessing, paymentStep }) {
  const [countdown, setCountdown] = useState(60);
  const maskedAccount = account ? account.slice(0, 6) + 'XXXX' + account.slice(-2) : '252XXXXXXXXXX';

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-sm animate-[slideUp_0.35s_ease-out]">

        {/* Phone Frame */}
        <div className="relative bg-slate-900 rounded-[2.5rem] p-2 shadow-[0_40px_80px_rgba(0,0,0,0.8)] border border-slate-700">

          {/* Phone notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-900 rounded-full z-10" />

          {/* Screen */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-[2.2rem] overflow-hidden min-h-[540px] flex flex-col">

            {/* Status Bar */}
            <div className="flex items-center justify-between px-6 pt-7 pb-2">
              <span className="text-white text-xs font-bold">12:26</span>
              <div className="flex items-center gap-1">
                <Signal className="w-3 h-3 text-white" />
                <Wifi className="w-3 h-3 text-white" />
                <Battery className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Notification Header */}
            <div className="flex-1 flex flex-col items-center justify-start px-4 pt-4 gap-4">

              {/* App Icon */}
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                  <span className="text-white font-black text-xl">MW</span>
                </div>
                {/* Notification bell pulse */}
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                  <Bell className="w-3 h-3 text-white" />
                </span>
                {/* Ripple animations */}
                <span className="absolute inset-0 rounded-2xl bg-emerald-400/30 animate-ping" />
              </div>

              {/* Title */}
              <div className="text-center space-y-1">
                <p className="text-emerald-400 text-xs font-bold tracking-widest uppercase">MWallet</p>
                <h2 className="text-white text-xl font-black">Codsi Lacag-bixin</h2>
                <p className="text-slate-400 text-xs">Payment Request Received</p>
              </div>

              {/* Notification Card */}
              <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                {/* Merchant Row */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">📚</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">BookVerse Store</p>
                    <p className="text-slate-400 text-xs">Merchant · Waxbari</p>
                  </div>
                </div>

                <div className="border-t border-white/10" />

                {/* Amount */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs">Lacagta</span>
                  <span className="text-emerald-400 font-black text-xl">${amount}</span>
                </div>

                {/* Account */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs">Xisaabtaada</span>
                  <span className="text-white font-mono text-sm font-bold">{maskedAccount}</span>
                </div>

                {/* Description */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs">Sababta</span>
                  <span className="text-slate-300 text-xs font-medium">Iibka Buugga</span>
                </div>
              </div>

              {/* Warning Text */}
              <p className="text-slate-400 text-xs text-center px-2 leading-relaxed">
                Ma ogoshahay in lacagta{' '}
                <span className="text-emerald-400 font-bold">${amount}</span>{' '}
                laga qaado xisaabtaada MWallet?
              </p>

              {/* Countdown */}
              {!isProcessing && (
                <div className="flex items-center gap-1 text-slate-500 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>Codsigu wuu dhacayaa {countdown}s</span>
                </div>
              )}

              {/* Processing State */}
              {isProcessing && (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
                  <p className="text-emerald-300 text-xs font-semibold text-center">
                    {paymentStep || 'Lacagta waxaa la diraayaa...'}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {!isProcessing && (
                <div className="flex gap-3 w-full pb-2">
                  {/* Decline */}
                  <button
                    type="button"
                    onClick={onDecline}
                    className="flex-1 py-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition hover:bg-rose-500/30"
                  >
                    <X className="w-4 h-4" />
                    Diid
                  </button>

                  {/* Confirm */}
                  <button
                    type="button"
                    onClick={onConfirm}
                    className="flex-2 flex-grow py-3.5 rounded-2xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition hover:bg-emerald-400 shadow-lg shadow-emerald-500/40"
                  >
                    <Check className="w-4 h-4" />
                    Xaqiiji &amp; Dir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-x-8 -bottom-6 h-12 bg-emerald-500/30 blur-2xl rounded-full" />
      </div>
    </div>
  );
}

// ─── Main Checkout Component ───────────────────────────────────────────────────
export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const deliveryFee = useSelector(selectDeliveryFee);
  const total = useSelector(selectCartTotal);

  // Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.address?.city || 'Mogadishu');
  const [district, setDistrict] = useState(user?.address?.district || 'Hodan');
  const [street, setStreet] = useState(user?.address?.street || 'Maka Al Mukarama');
  const [notes, setNotes] = useState('');

  // Payment State
  const [payerAccount, setPayerAccount] = useState(user?.phone || '252615554433');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Phone Confirmation Modal State
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">Please add items to your cart before proceeding to checkout.</p>
        <Link
          to="/books"
          className="inline-block px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs"
        >
          Browse Books
        </Link>
      </div>
    );
  }

  // Step 1: Validate form and show phone confirmation modal
  const handlePayNowClick = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isAuthenticated) {
      dispatch(showToast('Please log in to complete your purchase', 'info'));
      navigate('/login?redirect=/checkout');
      return;
    }

    if (!fullName.trim() || !email.trim() || !phone.trim() || !city.trim() || !street.trim()) {
      setErrorMessage('Please fill in all required shipping and contact information.');
      return;
    }

    if (!payerAccount.trim()) {
      setErrorMessage('Please enter your Mobile Wallet account number.');
      return;
    }

    const cleanAccount = payerAccount.trim().replace(/\s+/g, '');
    const accountRegex = /^(252\d{7,9}|06\d{7,8}|6\d{7,8}|\+?252\d{7,9}|\d{9,12})$/;
    if (!accountRegex.test(cleanAccount)) {
      setErrorMessage('Invalid MWallet format. Example: 252615554433 or 0615554433');
      return;
    }

    // Store payload and show the phone confirmation modal
    setPendingPayload({
      items: cartItems.map((item) => ({ bookId: item.bookId, quantity: item.quantity })),
      shippingAddress: {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
        district: district.trim(),
        street: street.trim(),
        notes: notes.trim()
      },
      payerAccount: cleanAccount
    });
    setShowPhoneModal(true);
  };

  // Step 2a: User confirmed on "phone" — process the actual payment
  const handlePhoneConfirm = async () => {
    if (!pendingPayload) return;

    try {
      setIsProcessing(true);
      setPaymentStep('Codsiga MWallet la dirayo...');
      await new Promise((r) => setTimeout(r, 500));

      setPaymentStep('Lacagta la xaqiijinayaa...');
      const res = await api.post('/orders/checkout', pendingPayload);

      setPaymentStep('Lacag-bixinta la xaqiijiyay! Rasiidka la samaynayaa...');
      await new Promise((r) => setTimeout(r, 400));

      if (res.data.success) {
        try {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        } catch {
          // ignore
        }
        setShowPhoneModal(false);
        dispatch(clearCart());
        dispatch(showToast('Lacag-bixinta waa guulaysatay! Dalabkaagii la xaqiijiyay.', 'success'));
        navigate(`/order-success/${res.data.data.order._id}`);
      }
    } catch (err) {
      setShowPhoneModal(false);
      setErrorMessage(
        err.message ||
          'Lacag-bixintu way ku guuldareysatay. Fadlan hubso balankaaga iyo lambarka xisaabta.'
      );
    } finally {
      setIsProcessing(false);
      setPaymentStep('');
    }
  };

  // Step 2b: User declined on phone
  const handlePhoneDecline = () => {
    setShowPhoneModal(false);
    setPendingPayload(null);
    dispatch(showToast('Lacag-bixintii waa la joojiyay.', 'info'));
  };

  const cleanAccountDisplay = payerAccount.trim().replace(/\s+/g, '');

  return (
    <>
      {/* Phone Confirmation Modal */}
      {showPhoneModal && (
        <PhoneConfirmModal
          amount={total.toFixed(2)}
          account={cleanAccountDisplay}
          onConfirm={handlePhoneConfirm}
          onDecline={handlePhoneDecline}
          isProcessing={isProcessing}
          paymentStep={paymentStep}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Title */}
        <div className="pb-4 border-b border-slate-200">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Cart</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 font-serif">
            Checkout &amp; MWallet Payment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete your delivery details and pay directly via MWallet mobile account
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs font-medium">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-sm font-bold">Khalad Lacag-bixin</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Main Checkout Grid */}
        <form onSubmit={handlePayNowClick} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. Customer Information */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base pb-3 border-b border-slate-100">
                <User className="w-4 h-4 text-emerald-600" />
                <span>Customer Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Mohamed Ali"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. customer@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +252 61 5554433"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Address */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base pb-3 border-b border-slate-100">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Delivery Address</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mogadishu"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">District / Neighborhood</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Hodan / Waberi"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Street Address &amp; Building / Gate *</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. Maka Al Mukarama St, Near Hotel"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Delivery Notes / Instructions (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Call before arrival, leave at reception"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. MWallet Payment Card */}
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-6 rounded-3xl shadow-xl space-y-5 border border-emerald-800/40">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs">
                    MW
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">MWallet Payment</h3>
                    <span className="text-[10px] text-emerald-400 font-semibold block">Official API_PURCHASE Integration</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold rounded-full uppercase">
                  Direct Mobile Pay
                </span>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-emerald-300">
                  Mobile Wallet Account Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={payerAccount}
                    onChange={(e) => setPayerAccount(e.target.value)}
                    placeholder="25261XXXXXXX"
                    className="w-full pl-11 pr-4 py-3 bg-white/10 border border-emerald-500/40 rounded-2xl text-white font-mono text-base tracking-wider placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/20 transition"
                  />
                  <Smartphone className="w-5 h-5 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-300 px-1">
                  <span>Format: 2526XXXXXXXX or 061XXXXXXX</span>
                  <span className="text-emerald-400 font-medium">Currency: USD ($)</span>
                </div>
              </div>

              {/* How it works */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-slate-300 space-y-2">
                <p className="flex items-center gap-1.5 font-semibold text-white">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sida ay u shaqeyso</span>
                </p>
                <ol className="space-y-1 text-slate-400 list-decimal list-inside">
                  <li>Riix "Pay Now" — codsi ayaa loo dirayaa telefoonkaaga</li>
                  <li>Notification ayaa ku timaada — xaqiiji lacag-bixinta</li>
                  <li>Rasiidka dalabkaaga ayaa si toos ah u soo bixi doona</li>
                </ol>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-slate-300">
                <p className="flex items-center gap-1.5 font-semibold text-white mb-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Encrypted Backend Gateway Protocol</span>
                </p>
                <p className="text-slate-400">
                  A unique payment reference and invoice ID will be generated. The charge is processed directly on the server.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review & Submit */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 font-serif pb-3 border-b border-slate-100">
              Order Review ({cartItems.length} items)
            </h3>

            {/* Items */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.bookId} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-10 h-14 object-cover rounded-lg shadow-sm shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-slate-900 truncate">{item.title}</h5>
                    <p className="text-slate-400 text-[11px]">Qty: {item.quantity} x ${item.effectivePrice.toFixed(2)}</p>
                  </div>
                  <span className="font-bold text-slate-900">${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-slate-900">
                  {deliveryFee === 0
                    ? <span className="text-emerald-600 font-extrabold">FREE</span>
                    : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Taxes &amp; Handling</span>
                <span className="font-bold text-slate-900">$0.00</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-base font-bold text-slate-900">Total Due</span>
                <span className="text-2xl font-black text-slate-900">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-base font-extrabold rounded-2xl shadow-xl shadow-emerald-600/30 flex flex-col items-center justify-center gap-1 transition"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span>Pay Now (${total.toFixed(2)})</span>
              </div>
              <span className="text-[10px] text-emerald-100 font-medium flex items-center gap-1">
                <Bell className="w-3 h-3" />
                Notification ayaa telefoonkaaga ku timaanaysa
              </span>
            </button>

            <p className="text-center text-[11px] text-slate-400">
              By clicking Pay Now, you authorize the charge of ${total.toFixed(2)} to your MWallet account.
            </p>
          </div>
        </form>
      </div>
    </>
  );
}
