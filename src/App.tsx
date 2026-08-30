import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AdminPortal } from './components/AdminPortal';
import { Product, CartItem, Order, ProductCategory } from './types';
import { api } from './services/api';
import {
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Package,
  RefreshCw,
  Truck,
  ShieldCheck,
  Headphones,
  RotateCcw
} from 'lucide-react';

const CATEGORIES: ProductCategory[] = ['All', 'Electronics', 'Accessories', 'Bags', 'Clothing'];

export default function App() {
  // Check if current URL route/hash indicates Admin Mode (#admin, /admin, or ?admin=true)
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    return hash.includes('admin') || search.includes('admin') || path.endsWith('/admin');
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart & Modals
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('testshop_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);

  // Listen to URL hash changes and secret keyboard shortcut (Ctrl+Shift+A)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      setIsAdminView(hash.includes('admin') || search.includes('admin'));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret Admin Key Shortcut: Ctrl + Shift + A or Cmd + Shift + A
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminView((prev) => {
          const next = !prev;
          if (next) {
            window.location.hash = 'admin';
          } else {
            window.location.hash = '';
          }
          return next;
        });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Sync cart to local storage
  useEffect(() => {
    localStorage.setItem('testshop_cart_items', JSON.stringify(cart));
  }, [cart]);

  // Load products
  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await api.getProducts(
        selectedCategory === 'All' ? undefined : selectedCategory,
        searchQuery || undefined
      );
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (!isAdminView) {
      loadProducts();
    }
  }, [selectedCategory, searchQuery, isAdminView]);

  // Cart Actions
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    handleAddToCart(product, quantity);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setLastCreatedOrder(order);
    setCart([]); // Clear cart
  };

  // ----------------------------------------------------
  // IF ADMIN ROUTE (#admin or ?admin=true): Render Admin Portal
  // ----------------------------------------------------
  if (isAdminView) {
    return (
      <AdminPortal
        onBackToShop={() => {
          window.location.hash = '';
          setIsAdminView(false);
        }}
      />
    );
  }

  // ----------------------------------------------------
  // PUBLIC STOREFRONT (100% Clean Customer View)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] text-neutral-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Value Banner */}
      <div className="bg-neutral-900 text-neutral-200 text-xs py-2 px-4 text-center font-medium">
        ✨ সারাদেশে ক্যাশ অন ডেলিভারি এবং দ্রুততম হোম ডেলিভারি সুবিধা!
      </div>

      {/* Public Navbar */}
      <Navbar
        cart={cart}
        setIsCartOpen={setIsCartOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white p-8 sm:p-12 mb-10 shadow-lg border border-neutral-800">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>প্রিমিয়াম কোয়ালিটি কালেকশন</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4">
                সেরা গ্যাজেট ও লাইফস্টাইল পণ্য এখন এক ঠিকানায়
              </h1>
              <p className="text-neutral-300 text-sm sm:text-base mb-6 leading-relaxed">
                উন্নত মানের ট্রেন্ডি গ্যাজেটস, ইলেকট্রনিক্স এবং ফ্যাশন আইটেম কিনুন ১০০% জেনুইন গ্যারান্টিতে।
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    const el = document.getElementById('product-catalog');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>পণ্য দেখুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-neutral-900">দ্রুত ডেলিভারি</h4>
                <p className="text-[11px] text-neutral-500">সারাদেশে হোম ডেলিভারি</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-neutral-900">১০০% অথেনটিক</h4>
                <p className="text-[11px] text-neutral-500">জেনুইন পণ্যের নিশ্চয়তা</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-neutral-900">৭ দিনের রিটার্ন</h4>
                <p className="text-[11px] text-neutral-500">সহজ রিটার্ন পলিসি</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-neutral-900">২৪/৭ সাপোর্ট</h4>
                <p className="text-[11px] text-neutral-500">যে কোনো প্রয়োজনে পাশে</p>
              </div>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div id="product-catalog" className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-neutral-500">
              <span>{products.length} টি পণ্য পাওয়া গেছে</span>
              <button
                onClick={loadProducts}
                className="p-2 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600 cursor-pointer"
                title="রিফ্রেশ"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingProducts ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Products Grid */}
          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-neutral-200/80 animate-pulse space-y-3">
                  <div className="w-full h-52 bg-neutral-200 rounded-xl" />
                  <div className="h-4 bg-neutral-200 rounded-md w-3/4" />
                  <div className="h-3 bg-neutral-100 rounded-md w-1/2" />
                  <div className="h-8 bg-neutral-200 rounded-xl mt-4" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center max-w-md mx-auto my-8">
              <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-neutral-800 mb-1">কোনো পণ্য পাওয়া যায়নি</h3>
              <p className="text-xs text-neutral-500 mb-4">
                {searchQuery ? `"${searchQuery}" এর জন্য কোনো ফলাফল নেই` : 'ক্যাটালগে বর্তমানে কোনো প্রোডাক্ট নেই'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-semibold"
                >
                  সার্চ ক্লিয়ার করুন
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onOpenDetail={(prod) => setSelectedProduct(prod)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Public Footer */}
      <footer className="bg-white border-t border-neutral-200 py-8 px-4 text-center text-xs text-neutral-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} TestShop. সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>নিরাপদ পেমেন্ট</span>
            <span>•</span>
            <span>প্রাইভেসি পলিসি</span>
            <span>•</span>
            <span>টার্মস ও কন্ডিশন</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onOrderSuccess={handleOrderSuccess}
      />

      {lastCreatedOrder && (
        <OrderSuccessModal
          order={lastCreatedOrder}
          onClose={() => setLastCreatedOrder(null)}
          onViewAdmin={() => setLastCreatedOrder(null)}
        />
      )}
    </div>
  );
}
