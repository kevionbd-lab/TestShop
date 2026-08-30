import React, { useState } from 'react';
import { X, User, Phone, MapPin, FileText, CheckCircle2, ShieldCheck, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { CartItem, Order } from '../types';
import { api } from '../services/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  onOrderSuccess,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার নাম লিখুন।');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setErrorMessage('সঠিক ফোন নম্বর প্রদান করুন (যেমন: 017XXXXXXXX)।');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।');
      return;
    }
    if (cart.length === 0) {
      setErrorMessage('কার্ট খালি। অন্তত একটি প্রোডাক্ট সিলেক্ট করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
        notes: notes || undefined,
        items: cart.map((c) => ({
          productId: c.product.id,
          quantity: c.quantity,
        })),
      };

      const createdOrder = await api.createOrder(payload);
      setIsSubmitting(false);
      onOrderSuccess(createdOrder);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        id="checkout-modal-container"
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 mb-1">
              <Sparkles className="w-3 h-3" />
              Cash on Delivery / ক্যাশ অন ডেলিভারি
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900">
              অর্ডার ফরম (Checkout)
            </h2>
          </div>

          <button
            id="btn-close-checkout-modal"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-200 text-neutral-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                আপনার নাম (Full Name) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  id="checkout-input-name"
                  type="text"
                  required
                  placeholder="যেমন: তানভীর আহমেদ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                মোবাইল নম্বর (Phone Number) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  id="checkout-input-phone"
                  type="tel"
                  required
                  placeholder="যেমন: 01712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                সম্পূর্ণ ঠিকানা (Full Delivery Address) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                <textarea
                  id="checkout-input-address"
                  required
                  rows={2}
                  placeholder="বাড়ি নং, রোড নং, এলাকা, শহর..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                বিশেষ নির্দেশনা (Notes / Optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                <textarea
                  id="checkout-input-notes"
                  rows={2}
                  placeholder="ডেলিভারি সংক্রান্ত কোনো বিশেষ নির্দেশনা থাকলে লিখুন..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              অর্ডার সারাংশ ({cart.length} টি আইটেম)
            </h4>
            <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
              {cart.map((it) => (
                <div key={it.product.id} className="flex justify-between items-center text-xs">
                  <span className="text-neutral-700 truncate max-w-[280px]">
                    {it.product.name} × {it.quantity}
                  </span>
                  <span className="font-semibold text-neutral-900">
                    ${(it.product.price * it.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-sm font-extrabold text-neutral-900">
              <span>পরিশোধযোগ্য মোট (Total Payable):</span>
              <span className="text-orange-600 text-base font-extrabold">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="btn-submit-order"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25 active:scale-98 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>D1 ডাটাবেজে সেভ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>অর্ডার নিশ্চিত করুন (Confirm Order)</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-neutral-400 mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              আপনার তথ্য Cloudflare D1-এ সুরক্ষিতভাবে সেভ করা হবে
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
