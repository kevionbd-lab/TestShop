import React from 'react';
import { Star, Plus, Eye, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isInCart: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onAddToCart,
  isInCart,
}) => {
  const discountPercent = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-white rounded-2xl border border-neutral-200/80 overflow-hidden flex flex-col hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-200/50 transition-all duration-300"
    >
      {/* Product Image Box */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100 cursor-pointer" onClick={() => onViewDetails(product)}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-neutral-900/80 text-white backdrop-blur-md rounded-lg">
            {product.category}
          </span>
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 text-[11px] font-bold bg-rose-500 text-white rounded-md shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Quick View Button on Hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(product);
          }}
          className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-white/90 backdrop-blur-md text-neutral-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-orange-600"
          title="Quick View"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating and Stock */}
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating ?? 4.8}</span>
              <span className="text-neutral-400 font-normal">({product.reviews_count ?? 24})</span>
            </div>
            <span className={product.stock > 5 ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onViewDetails(product)}
            className="font-bold text-neutral-900 text-base line-clamp-1 cursor-pointer hover:text-orange-600 transition-colors"
          >
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-neutral-500 text-xs line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Add to Cart Button */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-neutral-900 text-lg sm:text-xl">
                ${product.price.toFixed(2)}
              </span>
              {product.original_price && (
                <span className="text-xs text-neutral-400 line-through">
                  ${product.original_price.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-neutral-400 font-medium">≈ ৳{(product.price * 120).toFixed(0)} BDT</span>
          </div>

          <button
            id={`btn-add-to-cart-${product.id}`}
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isInCart
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-neutral-900 hover:bg-orange-600 text-white active:scale-95 shadow-xs'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isInCart ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Added
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
