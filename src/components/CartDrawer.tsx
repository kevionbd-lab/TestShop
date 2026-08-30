import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          id="cart-drawer-panel"
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
        >
          {/* Header */}
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-extrabold text-neutral-900 text-lg">শপিং কার্ট (Cart)</h2>
                <p className="text-xs text-neutral-500">{cart.length} টি আইটেম যোগ করা হয়েছে</p>
              </div>
            </div>

            <button
              id="btn-close-cart-drawer"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-3 text-neutral-300">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-neutral-700 text-base">আপনার কার্ট খালি</h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-[200px]">
                  পছন্দের প্রোডাক্ট কার্টে যোগ করে অর্ডার সম্পন্ন করুন।
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3.5 p-3 rounded-2xl bg-neutral-50 border border-neutral-100/80"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-18 h-18 rounded-xl object-cover bg-neutral-200 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-neutral-900 text-xs line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-neutral-400 hover:text-rose-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs font-semibold text-orange-600">
                        ${item.product.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-neutral-200 bg-white rounded-lg overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-100 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-bold text-neutral-900 min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-100 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-bold text-neutral-900 text-xs">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-neutral-100 bg-neutral-50/50">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Subtotal (সাবটোটাল)</span>
                  <span className="font-medium text-neutral-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>ডেলিভারি চার্জ (Shipping)</span>
                  <span className="font-semibold text-emerald-600">FREE (বিনামূল্যে)</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-neutral-900 pt-2 border-t border-neutral-200">
                  <span>Total Amount (সর্বমোট)</span>
                  <div className="text-right">
                    <span className="text-orange-600 text-lg">${subtotal.toFixed(2)}</span>
                    <span className="block text-[10px] text-neutral-400 font-normal">≈ ৳{(subtotal * 120).toFixed(0)} BDT</span>
                  </div>
                </div>
              </div>

              <button
                id="btn-proceed-to-checkout"
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 active:scale-98 transition-all"
              >
                <span>অর্ডার সম্পন্ন করতে এগিয়ে যান (Checkout)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
