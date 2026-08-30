import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  PackageCheck,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Database,
  ExternalLink,
  ChevronDown,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { api } from '../services/api';

interface AdminOrdersViewProps {
  onOpenGuide: () => void;
}

export const AdminOrdersView: React.FC<AdminOrdersViewProps> = ({ onOpenGuide }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const ok = await api.updateOrderStatus(orderId, newStatus);
      if (ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const s = search.toLowerCase();
    const matchesSearch =
      !search ||
      o.id.toLowerCase().includes(s) ||
      o.customer_name.toLowerCase().includes(s) ||
      o.customer_phone.toLowerCase().includes(s) ||
      o.customer_address.toLowerCase().includes(s);
    return matchesStatus && matchesSearch;
  });

  // Calculate Metrics
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.total_amount : sum), 0);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const confirmedCount = orders.filter((o) => o.status === 'confirmed').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <PackageCheck className="w-3 h-3" />
            Confirmed
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <Truck className="w-3 h-3" />
            Shipped
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-100 text-orange-600">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              অর্ডার ড্যাশবোর্ড (Admin Orders)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Cloudflare D1 Database (<code className="font-mono text-orange-600">orders</code> table)-এ সংরক্ষিত সব অর্ডারের লাইভ তালিকা
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-admin-refresh-orders"
            onClick={fetchOrders}
            disabled={loading}
            className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Refresh from D1"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-600' : ''}`} />
            <span className="hidden sm:inline">Refresh D1</span>
          </button>

          <button
            id="btn-admin-view-d1-guide"
            onClick={onOpenGuide}
            className="px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-orange-400" />
            <span>D1 Config & SQL</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6">
        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">মোট অর্ডার (Orders)</span>
          <div className="text-2xl font-extrabold text-neutral-900 mt-1">{orders.length}</div>
          <span className="text-[11px] text-neutral-400">Total D1 entries</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">মোট বিক্রয় (Revenue)</span>
          <div className="text-2xl font-extrabold text-orange-600 mt-1">${totalRevenue.toFixed(2)}</div>
          <span className="text-[11px] text-neutral-400">≈ ৳{(totalRevenue * 120).toFixed(0)} BDT</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">অপেক্ষমান (Pending)</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount}</div>
          <span className="text-[11px] text-neutral-400">Needs processing</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">ডেলিভার্ড (Delivered)</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{deliveredCount}</div>
          <span className="text-[11px] text-neutral-400">Successfully completed</span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 mb-6 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            id="admin-search-orders"
            type="text"
            placeholder="অর্ডার আইডি, নাম, ফোন বা ঠিকানা..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-500 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
            <p className="text-sm font-medium">Cloudflare D1 থেকে অর্ডার লোড হচ্ছে...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 space-y-3">
            <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
              <PackageCheck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-neutral-700">কোনো অর্ডার পাওয়া যায়নি</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {search || statusFilter !== 'all'
                ? 'আপনার সার্চ বা ফিল্টারের সাথে কোনো অর্ডার মেলেনি।'
                : 'এখনো কোনো অর্ডার তৈরি করা হয়নি। দোকান থেকে নতুন অর্ডার দিন!'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">অর্ডার আইডি</th>
                  <th className="py-3.5 px-4">গ্রাহকের তথ্য</th>
                  <th className="py-3.5 px-4">আইটেমস (Items)</th>
                  <th className="py-3.5 px-4">মোট টাকা</th>
                  <th className="py-3.5 px-4">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4">তারিখ</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                {filteredOrders.map((order) => {
                  let items: any[] = [];
                  try {
                    items = order.items || JSON.parse(order.items_json);
                  } catch {
                    items = [];
                  }

                  return (
                    <tr key={order.id} className="hover:bg-neutral-50/60 transition-colors">
                      {/* Order ID */}
                      <td className="py-4 px-4 sm:px-6 font-mono font-bold text-neutral-900">
                        <span className="bg-neutral-100 px-2 py-1 rounded-md border border-neutral-200/60">
                          {order.id}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-neutral-900">{order.customer_name}</div>
                        <div className="text-neutral-500 font-medium">{order.customer_phone}</div>
                        <div className="text-neutral-400 text-[11px] truncate max-w-[180px]" title={order.customer_address}>
                          {order.customer_address}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          {items.slice(0, 3).map((it, idx) => (
                            <img
                              key={idx}
                              src={it.image}
                              alt={it.name}
                              className="w-7 h-7 rounded-md object-cover bg-neutral-100 border border-neutral-200"
                              title={`${it.name} x ${it.quantity}`}
                            />
                          ))}
                          {items.length > 3 && (
                            <span className="text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600 font-bold">
                              +{items.length - 3}
                            </span>
                          )}
                          <span className="text-[11px] text-neutral-500 ml-1 font-medium">
                            ({items.reduce((s, i) => s + (i.quantity || 1), 0)} pcs)
                          </span>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-4 px-4 font-extrabold text-neutral-900 text-sm">
                        ${order.total_amount.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {getStatusBadge(order.status)}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-neutral-400 text-[11px]">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            id={`select-status-${order.id}`}
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold py-1.5 px-2.5 rounded-lg border-0 outline-none cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
