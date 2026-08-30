/**
 * Cloudflare Workers Backend for TestShop
 * Implements strict Cloudflare Worker fetch handler with Cloudflare D1 Database binding
 */

import type { Env, Product, OrderItem } from './types';

// Helper to create CORS and JSON responses
function jsonResponse(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers,
    },
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ success: false, error: message }, status);
}

// Initial seed data fallback when table needs seeding
const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Aero Wireless ANC Headphones',
    description: 'Premium noise-cancelling over-ear headphones with 40-hour battery life, spatial audio, and memory foam ear cushions.',
    price: 149.99,
    original_price: 199.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    category: 'Electronics',
    stock: 18,
    rating: 4.9,
    reviews_count: 86
  },
  {
    id: 'prod-2',
    name: 'Minimalist Chrono Smart Watch',
    description: 'Sleek stainless steel smart watch featuring AMOLED display, heart rate monitor, sleep tracking, and 7-day battery.',
    price: 89.50,
    original_price: 120.00,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    category: 'Electronics',
    stock: 25,
    rating: 4.7,
    reviews_count: 54
  },
  {
    id: 'prod-3',
    name: 'Ergonomic Mechanical Keyboard',
    description: 'Custom 75% hot-swappable mechanical keyboard with lubricated linear switches, RGB backlighting, and aluminum chassis.',
    price: 119.00,
    original_price: 149.00,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    category: 'Accessories',
    stock: 12,
    rating: 4.8,
    reviews_count: 42
  },
  {
    id: 'prod-4',
    name: 'Vintage Leather Daily Backpack',
    description: 'Handcrafted top-grain leather backpack with dedicated 15.6" laptop compartment, water-resistant lining, and brass hardware.',
    price: 79.99,
    original_price: 109.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    category: 'Bags',
    stock: 15,
    rating: 4.9,
    reviews_count: 67
  },
  {
    id: 'prod-5',
    name: 'Precision Wireless Ergonomic Mouse',
    description: 'Ultra-accurate optical sensor mouse with customizable thumb gestures, dual Bluetooth connectivity, and rapid USB-C charging.',
    price: 49.99,
    original_price: 65.00,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    category: 'Accessories',
    stock: 30,
    rating: 4.6,
    reviews_count: 38
  },
  {
    id: 'prod-6',
    name: 'Organic Heavyweight Cotton Hoodie',
    description: 'Plush 450 GSM French terry cotton hoodie with double-lined hood, kangaroo pocket, and relaxed streetwear fit.',
    price: 59.00,
    original_price: 75.00,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    category: 'Clothing',
    stock: 20,
    rating: 4.7,
    reviews_count: 29
  }
];

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    try {
      // ----------------------------------------------------
      // API ROUTES (/api/*)
      // ----------------------------------------------------

      // GET /api/health - Health check
      if (path === '/api/health' && method === 'GET') {
        return jsonResponse({
          status: 'ok',
          service: 'TestShop Cloudflare Worker',
          hasD1Binding: !!env.DB,
          timestamp: new Date().toISOString(),
        });
      }

      // POST /api/admin/login - Authenticate admin
      if (path === '/api/admin/login' && method === 'POST') {
        try {
          const body = (await request.json()) as { email?: string; password?: string };
          const email = (body.email || '').trim().toLowerCase();
          const password = (body.password || '').trim();

          const validAdmins = ['sh9145080@gmail.com', 'admin@testshop.com'];
          if (validAdmins.includes(email) && password === 'admin123456') {
            const token = 'admin_tok_' + crypto.randomUUID();
            return jsonResponse({
              success: true,
              token,
              email,
              message: 'Authentication successful',
            });
          }
          return errorResponse('অবৈধ ইমেইল অথবা পাসওয়ার্ড।', 401);
        } catch {
          return errorResponse('Invalid login payload', 400);
        }
      }

      // POST /api/admin/products - Add new product
      if (path === '/api/admin/products' && method === 'POST') {
        try {
          const body = (await request.json()) as any;
          if (!body.name || !body.price) {
            return errorResponse('Product name and price are required.');
          }

          const newId = body.id || `prod-${Date.now().toString(36)}`;
          const product = {
            id: newId,
            name: body.name.trim(),
            description: body.description || '',
            price: Number(body.price) || 0,
            original_price: body.original_price ? Number(body.original_price) : null,
            image: body.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
            category: body.category || 'Electronics',
            stock: Number(body.stock) || 10,
            rating: Number(body.rating) || 5.0,
            reviews_count: Number(body.reviews_count) || 0,
          };

          if (env.DB) {
            await env.DB.prepare(
              `INSERT INTO products (id, name, description, price, original_price, image, category, stock, rating, reviews_count)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            )
              .bind(
                product.id,
                product.name,
                product.description,
                product.price,
                product.original_price,
                product.image,
                product.category,
                product.stock,
                product.rating,
                product.reviews_count
              )
              .run();
          }

          return jsonResponse({ success: true, data: product, message: 'Product added successfully' }, 201);
        } catch (err: any) {
          return errorResponse(err?.message || 'Failed to add product', 500);
        }
      }

      // PUT /api/admin/products/:id - Edit existing product
      if (path.startsWith('/api/admin/products/') && (method === 'PUT' || method === 'PATCH')) {
        const productId = path.replace('/api/admin/products/', '');
        try {
          const body = (await request.json()) as any;

          if (env.DB) {
            await env.DB.prepare(
              `UPDATE products SET 
                name = COALESCE(?, name),
                description = COALESCE(?, description),
                price = COALESCE(?, price),
                original_price = COALESCE(?, original_price),
                image = COALESCE(?, image),
                category = COALESCE(?, category),
                stock = COALESCE(?, stock)
               WHERE id = ?`
            )
              .bind(
                body.name || null,
                body.description || null,
                body.price ? Number(body.price) : null,
                body.original_price ? Number(body.original_price) : null,
                body.image || null,
                body.category || null,
                body.stock !== undefined ? Number(body.stock) : null,
                productId
              )
              .run();
          }

          return jsonResponse({ success: true, message: 'Product updated successfully' });
        } catch (err: any) {
          return errorResponse(err?.message || 'Failed to update product', 500);
        }
      }

      // DELETE /api/admin/products/:id - Delete product
      if (path.startsWith('/api/admin/products/') && method === 'DELETE') {
        const productId = path.replace('/api/admin/products/', '');
        try {
          if (env.DB) {
            await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(productId).run();
          }
          return jsonResponse({ success: true, message: 'Product deleted successfully' });
        } catch (err: any) {
          return errorResponse(err?.message || 'Failed to delete product', 500);
        }
      }

      // POST /api/seed - Seed database with sample products if empty
      if (path === '/api/seed' && method === 'POST') {
        if (!env.DB) {
          return errorResponse('Cloudflare D1 binding "env.DB" is not available.', 500);
        }

        for (const item of INITIAL_PRODUCTS) {
          await env.DB.prepare(
            `INSERT OR REPLACE INTO products (id, name, description, price, original_price, image, category, stock, rating, reviews_count)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
            .bind(
              item.id,
              item.name,
              item.description,
              item.price,
              item.original_price,
              item.image,
              item.category,
              item.stock,
              item.rating,
              item.reviews_count
            )
            .run();
        }

        return jsonResponse({ success: true, message: 'Products seeded successfully into D1 database.' });
      }

      // GET /api/products - Get all products with optional filters
      if (path === '/api/products' && method === 'GET') {
        const category = url.searchParams.get('category');
        const search = url.searchParams.get('search');

        if (!env.DB) {
          // If D1 is not bound yet in dev environment, return fallback initial products
          let filtered = [...INITIAL_PRODUCTS];
          if (category && category !== 'All') {
            filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
          }
          if (search) {
            const s = search.toLowerCase();
            filtered = filtered.filter((p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
          }
          return jsonResponse({ success: true, data: filtered, note: 'Serving fallback catalog (D1 DB not bound)' });
        }

        let query = 'SELECT * FROM products';
        const params: (string | number)[] = [];
        const conditions: string[] = [];

        if (category && category !== 'All') {
          conditions.push('category = ?');
          params.push(category);
        }

        if (search) {
          conditions.push('(name LIKE ? OR description LIKE ?)');
          params.push(`%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
          query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC';

        const result = await env.DB.prepare(query).bind(...params).all();
        const products = result.results || [];

        // Auto-seed if empty
        if (products.length === 0 && !category && !search) {
          for (const item of INITIAL_PRODUCTS) {
            await env.DB.prepare(
              `INSERT OR IGNORE INTO products (id, name, description, price, original_price, image, category, stock, rating, reviews_count)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            )
              .bind(
                item.id,
                item.name,
                item.description,
                item.price,
                item.original_price,
                item.image,
                item.category,
                item.stock,
                item.rating,
                item.reviews_count
              )
              .run();
          }
          const seeded = await env.DB.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
          return jsonResponse({ success: true, data: seeded.results });
        }

        return jsonResponse({ success: true, data: products });
      }

      // GET /api/products/:id - Single product detail
      if (path.startsWith('/api/products/') && method === 'GET') {
        const productId = path.replace('/api/products/', '');

        if (!env.DB) {
          const item = INITIAL_PRODUCTS.find((p) => p.id === productId);
          if (!item) return errorResponse('Product not found', 404);
          return jsonResponse({ success: true, data: item });
        }

        const product = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(productId).first();
        if (!product) {
          return errorResponse('Product not found', 404);
        }
        return jsonResponse({ success: true, data: product });
      }

      // POST /api/orders - Submit a new order
      if (path === '/api/orders' && method === 'POST') {
        const body = (await request.json()) as {
          customer_name?: string;
          customer_phone?: string;
          customer_address?: string;
          notes?: string;
          items?: { productId: string; quantity: number }[];
        };

        if (!body.customer_name || !body.customer_phone || !body.customer_address) {
          return errorResponse('Please provide Customer Name, Phone, and Address.');
        }

        if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
          return errorResponse('Cart is empty. Please select at least one product.');
        }

        // Fetch products to compute total amount safely and populate item snapshot
        const orderItems: OrderItem[] = [];
        let totalAmount = 0;

        for (const cartItem of body.items) {
          let product: Product | null = null;

          if (env.DB) {
            product = (await env.DB.prepare('SELECT * FROM products WHERE id = ?')
              .bind(cartItem.productId)
              .first()) as Product | null;
          } else {
            product = (INITIAL_PRODUCTS.find((p) => p.id === cartItem.productId) as Product) || null;
          }

          if (!product) {
            return errorResponse(`Product ID ${cartItem.productId} not found.`);
          }

          const qty = Math.max(1, Number(cartItem.quantity) || 1);
          const itemTotal = product.price * qty;
          totalAmount += itemTotal;

          orderItems.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: qty,
            image: product.image,
          });
        }

        // Use Web Crypto API for secure UUID generation
        const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
        const itemsJson = JSON.stringify(orderItems);

        if (env.DB) {
          await env.DB.prepare(
            `INSERT INTO orders (id, customer_name, customer_phone, customer_address, notes, total_amount, status, items_json)
             VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`
          )
            .bind(
              orderId,
              body.customer_name.trim(),
              body.customer_phone.trim(),
              body.customer_address.trim(),
              body.notes?.trim() || null,
              totalAmount,
              itemsJson
            )
            .run();
        }

        const newOrder = {
          id: orderId,
          customer_name: body.customer_name.trim(),
          customer_phone: body.customer_phone.trim(),
          customer_address: body.customer_address.trim(),
          notes: body.notes?.trim() || null,
          total_amount: totalAmount,
          status: 'pending',
          items_json: itemsJson,
          items: orderItems,
          created_at: new Date().toISOString(),
        };

        return jsonResponse(
          {
            success: true,
            data: newOrder,
            message: 'Order created successfully!',
          },
          201
        );
      }

      // GET /api/orders - Admin: List all orders
      if (path === '/api/orders' && method === 'GET') {
        if (!env.DB) {
          return jsonResponse({
            success: true,
            data: [],
            note: 'D1 database binding not connected in local standalone mode. Run in Cloudflare Workers to view live D1 records.',
          });
        }

        const ordersResult = await env.DB.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
        const orders = (ordersResult.results || []).map((row: any) => {
          let parsedItems = [];
          try {
            parsedItems = JSON.parse(row.items_json);
          } catch {
            parsedItems = [];
          }
          return {
            ...row,
            items: parsedItems,
          };
        });

        return jsonResponse({ success: true, data: orders });
      }

      // PATCH /api/orders/:id - Admin: Update order status
      if (path.startsWith('/api/orders/') && method === 'PATCH') {
        const orderId = path.replace('/api/orders/', '');
        const body = (await request.json()) as { status?: string };

        if (!body.status) {
          return errorResponse('Status is required.');
        }

        const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(body.status)) {
          return errorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        if (env.DB) {
          const result = await env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?')
            .bind(body.status, orderId)
            .run();

          if (result.meta?.changes === 0) {
            return errorResponse('Order not found', 404);
          }
        }

        return jsonResponse({
          success: true,
          message: `Order status updated to ${body.status}`,
          data: { id: orderId, status: body.status },
        });
      }

      // ----------------------------------------------------
      // STATIC ASSETS FALLBACK (Cloudflare Workers Assets)
      // ----------------------------------------------------
      if (env.ASSETS) {
        return await env.ASSETS.fetch(request);
      }

      // Fallback 404 for unknown API routes
      return errorResponse(`Route not found: ${method} ${path}`, 404);
    } catch (err: any) {
      console.error('Worker error:', err);
      return errorResponse(err?.message || 'Internal Server Error', 500);
    }
  },
};
