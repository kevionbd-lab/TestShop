import { Product, Order, CreateOrderPayload, OrderStatus, ApiResponse } from '../types';
import { INITIAL_PRODUCTS, SAMPLE_ORDERS } from '../data/mockData';

// Local storage keys for standalone preview fallback
const STORAGE_PRODUCTS_KEY = 'testshop_d1_products_v1';
const STORAGE_ORDERS_KEY = 'testshop_d1_orders_v1';

function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_PRODUCTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
}

function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(SAMPLE_ORDERS));
  return SAMPLE_ORDERS;
}

export const api = {
  // 1. Fetch Products
  async getProducts(category?: string, search?: string): Promise<Product[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.set('category', category);
      if (search) params.set('search', search);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const json = (await res.json()) as any;
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch {
      // Fallback in case Worker /api is not running in local Vite mode
    }

    // Local fallback
    let products = getLocalProducts();
    if (category && category !== 'All') {
      products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const s = search.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
    }
    return products;
  },

  // 2. Fetch Single Product
  async getProduct(id: string): Promise<Product | null> {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (res.ok) {
        const json = (await res.json()) as any;
        if (json.success && json.data) return json.data;
      }
    } catch {}

    const products = getLocalProducts();
    return products.find((p) => p.id === id) || null;
  },

  // 3. Create Order
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = (await res.json()) as any;
        if (json.success && json.data) {
          // Also sync to local storage for instant feedback
          const orders = getLocalOrders();
          orders.unshift(json.data);
          localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
          return json.data;
        }
      }
    } catch {}

    // Local fallback order generation with Web Crypto
    const products = getLocalProducts();
    const orderItems = payload.items.map((it) => {
      const prod = products.find((p) => p.id === it.productId) || {
        id: it.productId,
        name: 'Product',
        price: 50,
        image: '',
      };
      return {
        productId: prod.id,
        name: prod.name,
        price: prod.price,
        quantity: it.quantity,
        image: prod.image,
      };
    });

    const totalAmount = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;

    const newOrder: Order = {
      id: orderId,
      customer_name: payload.customer_name.trim(),
      customer_phone: payload.customer_phone.trim(),
      customer_address: payload.customer_address.trim(),
      notes: payload.notes?.trim() || null,
      total_amount: totalAmount,
      status: 'pending',
      items_json: JSON.stringify(orderItems),
      items: orderItems,
      created_at: new Date().toISOString(),
    };

    const orders = getLocalOrders();
    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    return newOrder;
  },

  // 4. Get All Orders (Admin)
  async getOrders(): Promise<Order[]> {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const json = (await res.json()) as any;
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch {}

    return getLocalOrders();
  },

  // 5. Update Order Status (Admin)
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const json = (await res.json()) as any;
        if (json.success) {
          const orders = getLocalOrders();
          const target = orders.find((o) => o.id === orderId);
          if (target) {
            target.status = status;
            localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
          }
          return true;
        }
      }
    } catch {}

    const orders = getLocalOrders();
    const target = orders.find((o) => o.id === orderId);
    if (target) {
      target.status = status;
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
      return true;
    }
    return false;
  },

  // 6. Reset / Seed D1 Database helper
  async seedDatabase(): Promise<boolean> {
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) return true;
    } catch {}
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return true;
  }
};
