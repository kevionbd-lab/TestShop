import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AdminOrdersView } from './components/AdminOrdersView';
import { D1SetupGuideModal } from './components/D1SetupGuideModal';
import { Product, CartItem, Order, ProductCategory } from './types';
import { api } from './services/api';
import {
  Sparkles,
  ShoppingBag,
  Zap,
  CheckCircle,
  Database,
  ArrowRight,
  ShieldCheck,
  Package,
  Layers,
  RefreshCw,
  Search
} from 'lucide-react';

const CATEGORIES: ProductCategory[] = ['All', 'Electronics', 'Accessories', 'Bags', 'Clothing'];

export default function App() {
  const [activeTab, setActiveTab] = useState<'shop' | 'admin' | 'guide'>('shop');
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
  const [isD1GuideOpen, setIsD1GuideOpen] = useState(false);

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
    loadProducts();
  }, [selectedCategory, searchQuery]);

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

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] text-neutral-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Notification Bar */}
      <div className="bg-neutral-900 text-white text-[11px] py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Cloudflare Workers Backend Active • Cloudflare D1 Database Ready</span>
        <button
          onClick={() => setIsD1GuideOpen(true)}
          className="ml-2 underline text-orange-300 hover:text-white font-semibold cursor-pointer"
        >
          View D1 Setup
        </button>
      </div>

      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cart={cart}
        setIsCartOpen={setIsCartOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={(c) => setSelectedCategory(c as ProductCategory)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'admin' ? (
          <AdminOrdersView onOpenGuide={() => setIsD1GuideOpen(true)} />
        ) : activeTab === 'guide' ? (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-neutral-900">
                    Cloudflare Workers & D1 Integration
                  </h1>
                  <p className="text-xs text-neutral-500">
                    Configuration details, rules, and deployment instructions
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-neutral-700">
                <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200">
                  <h4 className="font-bold text-orange-800 text-xs uppercase mb-1">
                    Worker Architecture
                  </h4>
                  <p className="text-xs text-orange-950 leading-relaxed">
                    This project uses a pure Cloudflare Worker fetch handler (<code>export default &#123; async fetch(request, env) &#125;</code>) with zero Express dependencies. All database calls utilize the native Cloudflare D1 binding (<code>env.DB.prepare()</code>) and Web Crypto API for secure IDs.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setIsD1GuideOpen(true)}
                    className="p-4 rounded-2xl bg-neutral-900 text-white font-bold text-xs flex items-center justify-between hover:bg-neutral-800 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-orange-400" />
                      Open Step-by-Step D1 Guide & SQL
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveTab('shop')}
                    className="p-4 rounded-2xl bg-orange-500 text-white font-bold text-xs flex items-center justify-between hover:bg-orange-600 transition-colors shadow-sm"
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      Browse Store Products
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Shop Tab */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Hero Banner */}
            <div className="relative rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white p-6 sm:p-10 mb-8 overflow-hidden shadow-xl">
              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 mb-3">
                  <Zap className="w-3.5 h-3.5" />
                  Cloudflare D1 Powered Shop
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  TestShop — প্রিমিয়াম গ্যাজেটস ও ফ্যাশন কালেকশন
                </h1>
                <p className="text-xs sm:text-sm text-neutral-300 mt-2.5 leading-relaxed max-w-lg">
                  সরাসরি Cloudflare Edge থেকে অতি দ্রুত লোডিং এবং সহজ ক্যাশ অন ডেলিভারি অর্ডারিং।
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      const el = document.getElementById('product-catalog-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/25 active:scale-95 transition-all"
                  >
                    <span>প্রোডাক্ট দেখুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setActiveTab('admin')}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 text-xs font-semibold backdrop-blur-md transition-colors"
                  >
                    Admin Orders দেখুন
                  </button>
                </div>
              </div>

              {/* Decorative Background Elements */}
              <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-3 text-neutral-700">
                <Database className="w-36 h-36 opacity-10" />
              </div>
            </div>

            {/* Category Filter Chips */}
            <div id="product-catalog-section" className="mb-6 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    id={`cat-filter-${cat.toLowerCase()}`}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-neutral-900 text-white shadow-sm'
                        : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/80'
                    }`}
                  >
                    {cat === 'All' ? 'All Products (সব)' : cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium ml-auto">
                <span>{products.length} টি প্রোডাক্ট প্রদর্শিত</span>
                <button
                  onClick={loadProducts}
                  className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-600 transition-colors"
                  title="Reload catalog"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingProducts ? 'animate-spin text-orange-600' : ''}`} />
                </button>
              </div>
            </div>

            {/* Products Grid */}
            {loadingProducts ? (
              <div className="p-16 text-center text-neutral-400 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
                <p className="text-xs font-semibold">প্রোডাক্ট লোড হচ্ছে...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center text-neutral-400 space-y-3">
                <Package className="w-10 h-10 mx-auto text-neutral-300" />
                <h3 className="text-base font-bold text-neutral-700">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
                <p className="text-xs text-neutral-400">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {products.map((product) => {
                  const inCart = cart.some((c) => c.product.id === product.id);
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={(p) => setSelectedProduct(p)}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      isInCart={inCart}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-neutral-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-[10px]">
              TS
            </div>
            <span className="font-bold text-neutral-800">TestShop</span>
            <span>• Cloudflare Workers + D1 Powered</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsD1GuideOpen(true)}
              className="hover:text-orange-600 transition-colors"
            >
              D1 Database Guide
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className="hover:text-orange-600 transition-colors"
            >
              Admin Dashboard
            </button>
          </div>

          <p className="text-neutral-400 text-[11px]">
            &copy; {new Date().getFullYear()} TestShop. Ready for Cloudflare deployment.
          </p>
        </div>
      </footer>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Success Modal */}
      {lastCreatedOrder && (
        <OrderSuccessModal
          order={lastCreatedOrder}
          onClose={() => setLastCreatedOrder(null)}
          onViewAdmin={() => {
            setLastCreatedOrder(null);
            setActiveTab('admin');
          }}
        />
      )}

      {/* D1 Setup Guide Modal */}
      <D1SetupGuideModal
        isOpen={isD1GuideOpen}
        onClose={() => setIsD1GuideOpen(false)}
      />
    </div>
  );
}
