import React from 'react';
import { CheckCircle, Package, ArrowRight, ShieldCheck, Copy, Check } from 'lucide-react';
import { Order } from '../types';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onViewAdmin: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onViewAdmin,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!order) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        id="order-success-modal"
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden text-center p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <CheckCircle className="w-9 h-9" />
        </div>

        <h2 className="text-2xl font-extrabold text-neutral-900">
          অর্ডার সফল হয়েছে! 🎉
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          ধন্যবাদ! আপনার অর্ডারটি Cloudflare D1-এর <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded font-mono text-xs">orders</code> টেবিলে সংরক্ষিত হয়েছে।
        </p>

        {/* Order Details Card */}
        <div className="mt-6 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">অর্ডার নম্বর (Order ID):</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-neutral-800 bg-white px-2 py-1 rounded-md border border-neutral-200">
                {order.id}
              </span>
              <button
                onClick={handleCopyId}
                className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors"
                title="Copy Order ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">গ্রাহকের নাম:</span>
            <span className="font-semibold text-neutral-800">{order.customer_name}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">ফোন নম্বর:</span>
            <span className="font-semibold text-neutral-800">{order.customer_phone}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">ডেলিভারি ঠিকানা:</span>
            <span className="font-semibold text-neutral-800 truncate max-w-[200px]">{order.customer_address}</span>
          </div>

          <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-700">মোট বিল (Total Bill):</span>
            <span className="text-base font-extrabold text-orange-600">${order.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            id="btn-success-view-admin"
            onClick={() => {
              onClose();
              onViewAdmin();
            }}
            className="py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-orange-400" />
            <span>Admin-এ অর্ডার দেখুন</span>
          </button>

          <button
            id="btn-success-continue-shopping"
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <span>আরও শপিং করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
