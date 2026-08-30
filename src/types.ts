/**
 * Types definition for TestShop - Cloudflare Workers & D1 E-Commerce App
 */

// Cloudflare Worker Environment Interface
export interface Env {
  DB: D1Database;
  ASSETS?: Fetcher;
  [key: string]: unknown;
}

export type ProductCategory = 'All' | 'Electronics' | 'Accessories' | 'Bags' | 'Clothing';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number | null;
  image: string;
  category: string;
  stock: number;
  rating?: number;
  reviews_count?: number;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  notes?: string | null;
  total_amount: number;
  status: OrderStatus;
  items_json: string; // JSON string in D1
  items?: OrderItem[]; // Parsed array for UI
  created_at: string;
}

export interface CreateOrderPayload {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  notes?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
