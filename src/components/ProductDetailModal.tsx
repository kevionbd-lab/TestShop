import React, { useState } from 'react';
import { X, Star, ShoppingCart, Check, Truck, ShieldCheck, ArrowRight, Package } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!product) return null;

  const discountPercent = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        id="product-detail-modal"
        className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-product-detail"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-neutral-100 text-neutral-600 transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image */}
          <div className="relative bg-neutral-100 aspect-square md:aspect-auto md:h-full overflow-hidden flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-neutral-900/80 text-white backdrop-blur-md rounded-lg">
                {product.category}
              </span>
              {discountPercent > 0 && (
                <span className="px-2.5 py-1 text-xs font-bold bg-rose-500 text-white rounded-lg shadow-sm">
                  Save {discountPercent}%
                </span>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Rating & Stock */}
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                <div className="flex items-center gap-1.5 text-amber-500 font-semibold">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-neutral-700 font-bold">{product.rating ?? 4.8}</span>
                  <span className="text-neutral-400">({product.reviews_count ?? 24} reviews)</span>
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <Package className="w-3 h-3" />
                  {product.stock} Units left
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight leading-snug">
                {product.name}
              </h2>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-neutral-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.original_price && (
                  <span className="text-base text-neutral-400 line-through">
                    ${product.original_price.toFixed(2)}
                  </span>
                )}
                <span className="ml-2 text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-md">
                  ≈ ৳{(product.price * 120).toFixed(0)} BDT
                </span>
              </div>

              {/* Description */}
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Description
                </h4>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Features list */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-neutral-600">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-50 border border-neutral-100">
                  <Truck className="w-4 h-4 text-orange-500" />
                  <span>Free Delivery Nationwide</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-50 border border-neutral-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>7 Days Return Warranty</span>
                </div>
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="mt-6 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xs font-bold uppercase text-neutral-500">পরিমাণ (Quantity):</span>
                <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-200 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-sm font-bold text-neutral-900 min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-200 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  id="btn-modal-add-cart"
                  onClick={handleAdd}
                  className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    addedAnimation
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900'
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4" />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      কার্টে যোগ করুন
                    </>
                  )}
                </button>

                <button
                  id="btn-modal-buy-now"
                  onClick={() => {
                    onBuyNow(product, quantity);
                    onClose();
                  }}
                  className="py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                >
                  <span>এখনই কিনুন (Buy Now)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
