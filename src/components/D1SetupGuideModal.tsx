import React, { useState } from 'react';
import { X, Database, Terminal, Check, Copy, Sparkles, BookOpen, Layers, ShieldCheck } from 'lucide-react';

interface D1SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const D1SetupGuideModal: React.FC<D1SetupGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const d1CreateCommand = `npx wrangler d1 create testshop-db`;
  const migrationCommand = `npx wrangler d1 execute testshop-db --file=./migrations/0001_init.sql --remote`;
  const deployCommand = `npm run build && npx wrangler deploy`;

  const migrationSql = `-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    original_price REAL,
    image TEXT NOT NULL,
    category TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 10,
    rating REAL DEFAULT 4.8,
    reviews_count INTEGER DEFAULT 24,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    notes TEXT,
    total_amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    items_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        id="d1-guide-modal-content"
        className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-neutral-900">
                Cloudflare Workers & D1 ডেপ্লয়মেন্ট নির্দেশিকা
              </h2>
              <p className="text-xs text-neutral-500">
                Wrangler কনফিগারেশন, D1 Binding এবং মাইগ্রেশন সম্পন্ন করার নিয়ম
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-200 text-neutral-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Step 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold">
                1
              </span>
              <h3 className="font-bold text-neutral-900 text-sm">
                Cloudflare D1 ডাটাবেজ তৈরি করুন (Create D1 Database)
              </h3>
            </div>
            <p className="text-xs text-neutral-600 pl-8">
              আপনার টার্মিনালে নিচের কমান্ডটি রান করুন অথবা Cloudflare Dashboard &gt; D1 থেকে <code>testshop-db</code> তৈরি করুন:
            </p>
            <div className="ml-8 relative bg-neutral-900 text-neutral-100 rounded-xl p-3 text-xs font-mono flex items-center justify-between">
              <code>{d1CreateCommand}</code>
              <button
                onClick={() => copyToClipboard(d1CreateCommand, 'cmd1')}
                className="p-1 text-neutral-400 hover:text-white"
              >
                {copiedSection === 'cmd1' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold">
                2
              </span>
              <h3 className="font-bold text-neutral-900 text-sm">
                <code>wrangler.jsonc</code>-এ <code>database_id</code> আপডেট করুন
              </h3>
            </div>
            <p className="text-xs text-neutral-600 pl-8">
              Cloudflare Dashboard বা টার্মিনালের আউটপুট থেকে পাওয়া UUID-টি <code>wrangler.jsonc</code> ফাইলে <code>"database_id": "REPLACE_ME"</code> এর জায়গায় বসিয়ে দিন।
            </p>
            <div className="ml-8 bg-neutral-100 rounded-xl p-3 text-xs font-mono text-neutral-800 border border-neutral-200">
              <span className="text-neutral-500">// wrangler.jsonc snippet</span>
              <br />
              {`"d1_databases": [`}
              <br />
              {`  { "binding": "DB", "database_name": "testshop-db", "database_id": "your-d1-uuid-here" }`}
              <br />
              {`]`}
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold">
                3
              </span>
              <h3 className="font-bold text-neutral-900 text-sm">
                SQL Migration রান করুন (Execute Migration)
              </h3>
            </div>
            <p className="text-xs text-neutral-600 pl-8">
              প্রজেক্টের <code>migrations/0001_init.sql</code> ফাইলটি দিয়ে ডাটাবেজ টেবিল এবং স্যাম্পল প্রোডাক্ট তৈরি করতে নিচের কমান্ড দিন:
            </p>
            <div className="ml-8 relative bg-neutral-900 text-neutral-100 rounded-xl p-3 text-xs font-mono flex items-center justify-between">
              <code>{migrationCommand}</code>
              <button
                onClick={() => copyToClipboard(migrationCommand, 'cmd2')}
                className="p-1 text-neutral-400 hover:text-white"
              >
                {copiedSection === 'cmd2' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Step 4 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold">
                4
              </span>
              <h3 className="font-bold text-neutral-900 text-sm">
                Cloudflare Workers-এ Deploy করুন
              </h3>
            </div>
            <p className="text-xs text-neutral-600 pl-8">
              ফ্রন্টএন্ড বিল্ড করে Workers-এ আপলোড করুন:
            </p>
            <div className="ml-8 relative bg-neutral-900 text-neutral-100 rounded-xl p-3 text-xs font-mono flex items-center justify-between">
              <code>{deployCommand}</code>
              <button
                onClick={() => copyToClipboard(deployCommand, 'cmd3')}
                className="p-1 text-neutral-400 hover:text-white"
              >
                {copiedSection === 'cmd3' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Raw Migration SQL View */}
          <div className="pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                ম্যানুয়াল রান করার জন্য Schema SQL (Console Query)
              </h4>
              <button
                onClick={() => copyToClipboard(migrationSql, 'sql')}
                className="text-xs font-semibold text-orange-600 flex items-center gap-1 hover:underline"
              >
                {copiedSection === 'sql' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied SQL!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy SQL
                  </>
                )}
              </button>
            </div>
            <pre className="bg-neutral-900 text-emerald-400 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48">
              {migrationSql}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition-colors"
          >
            বুঝেছি (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
