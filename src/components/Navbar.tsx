import React from 'react';
import { ShoppingBag, ShieldCheck, Database, ShoppingCart, Search, Menu, X, Sparkles } from 'lucide-react';
import { CartItem } from '../types';

interface NavbarProps {
  activeTab: 'shop' | 'admin' | 'guide';
  setActiveTab: (tab: 'shop' | 'admin' | 'guide') => void;
  cart: CartItem[];
  setIsCartOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cart,
  setIsCartOpen,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              id="nav-logo-btn"
              onClick={() => setActiveTab('shop')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-sm shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-neutral-900 flex items-center gap-1.5">
                  TestShop
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-700">
                    Workers + D1
                  </span>
                </span>
                <p className="text-xs text-neutral-500 font-medium hidden sm:block">
                  Cloudflare Edge E-Commerce
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Search Bar (shown on shop tab) */}
          {activeTab === 'shop' && (
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  id="nav-search-input"
                  type="text"
                  placeholder="প্রোডাক্ট বা ক্যাটাগরি সার্চ করুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white text-sm rounded-xl border border-transparent focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Navigation Links & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Tabs */}
            <div className="hidden md:flex items-center bg-neutral-100 p-1 rounded-xl">
              <button
                id="tab-shop-btn"
                onClick={() => setActiveTab('shop')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'shop'
                    ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Shop (দোকান)
              </button>
              <button
                id="tab-admin-btn"
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                Admin Orders
              </button>
              <button
                id="tab-guide-btn"
                onClick={() => setActiveTab('guide')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'guide'
                    ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-neutral-600" />
                D1 Guide
              </button>
            </div>

            {/* Cart Button */}
            <button
              id="cart-drawer-trigger-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 sm:px-4 sm:py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm flex items-center gap-2 shadow-sm shadow-orange-500/20 active:scale-95 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {totalCartCount > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold bg-white text-orange-600 rounded-full">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Sub-Header & Search */}
        {activeTab === 'shop' && (
          <div className="md:hidden pb-3">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                id="mobile-search-input"
                type="text"
                placeholder="প্রোডাক্ট সার্চ করুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-100 text-sm rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>
        )}

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-neutral-200 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => {
                setActiveTab('shop');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'shop' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-neutral-700'
              }`}
            >
              🛍️ Shop (প্রোডাক্ট তালিকা)
            </button>
            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                activeTab === 'admin' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-neutral-700'
              }`}
            >
              <span>🛡️ Admin Orders Dashboard</span>
              <span className="text-[10px] bg-neutral-200 px-2 py-0.5 rounded text-neutral-700">D1 Table</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('guide');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'guide' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-neutral-700'
              }`}
            >
              📖 Cloudflare D1 Deployment Guide
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
