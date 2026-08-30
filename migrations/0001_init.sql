-- Cloudflare D1 Migration for TestShop
-- File: migrations/0001_init.sql

-- 1. Create Products Table
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

-- Create Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

-- 3. Seed Initial Products Data
INSERT OR IGNORE INTO products (id, name, description, price, original_price, image, category, stock, rating, reviews_count) VALUES
('prod-1', 'Aero Wireless ANC Headphones', 'Premium noise-cancelling over-ear headphones with 40-hour battery life, spatial audio, and memory foam ear cushions.', 149.99, 199.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', 'Electronics', 18, 4.9, 86),
('prod-2', 'Minimalist Chrono Smart Watch', 'Sleek stainless steel smart watch featuring AMOLED display, heart rate monitor, sleep tracking, and 7-day battery.', 89.50, 120.00, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', 'Electronics', 25, 4.7, 54),
('prod-3', 'Ergonomic Mechanical Keyboard', 'Custom 75% hot-swappable mechanical keyboard with lubricated linear switches, RGB backlighting, and aluminum chassis.', 119.00, 149.00, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', 'Accessories', 12, 4.8, 42),
('prod-4', 'Vintage Leather Daily Backpack', 'Handcrafted top-grain leather backpack with dedicated 15.6" laptop compartment, water-resistant lining, and brass hardware.', 79.99, 109.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80', 'Bags', 15, 4.9, 67),
('prod-5', 'Precision Wireless Ergonomic Mouse', 'Ultra-accurate optical sensor mouse with customizable thumb gestures, dual Bluetooth connectivity, and rapid USB-C charging.', 49.99, 65.00, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80', 'Accessories', 30, 4.6, 38),
('prod-6', 'Organic Heavyweight Cotton Hoodie', 'Plush 450 GSM French terry cotton hoodie with double-lined hood, kangaroo pocket, and relaxed streetwear fit.', 59.00, 75.00, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80', 'Clothing', 20, 4.7, 29);
