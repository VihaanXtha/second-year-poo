import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Order } from '../types';

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export const OrdersPage: React.FC<{ apiFetch: ApiFetch }> = ({ apiFetch }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 8;

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (statusFilter !== 'All') params.set('status', statusFilter.toLowerCase());
        const data = await apiFetch(`/admin/orders?${params.toString()}`);
        setOrders(data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiFetch, searchQuery, statusFilter]);

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      await apiFetch(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" subtitle="Manage customer orders" />

      <div className="flex items-center gap-2 flex-wrap">
        {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              statusFilter === s
                ? 'bg-primary text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by order ID or customer..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
        />
      </div>

      <DataTable
        data={currentOrders}
        columns={[
          { key: 'order_number', header: 'Order', render: (item: Order) => (
            <span className="font-mono text-sm text-slate-700 font-medium">#{item.order_number}</span>
          )},
          { key: 'customer', header: 'Customer', render: (item: Order) => (
            <span className="font-medium text-slate-900 text-sm">{item.user?.name || 'Unknown'}</span>
          )},
          { key: 'status', header: 'Status', render: (item: Order) => (
            <select
              value={item.status}
              onChange={(e) => handleStatusChange(item.id, e.target.value)}
              className={`font-mono text-xs px-2.5 py-1.5 rounded-lg border-0 cursor-pointer font-semibold ${
                STATUS_STYLES[item.status] || 'bg-slate-100 text-slate-600'
              }`}
            >
              {Object.keys(STATUS_STYLES).map((s) => (
                <option key={s} value={s} className="text-xs">{s}</option>
              ))}
            </select>
          )},
          { key: 'total', header: 'Total', className: 'text-right', render: (item: Order) => (
            <span className="font-mono font-bold text-slate-900 text-sm">Rs. {Number(item.total).toLocaleString()}</span>
          )},
          { key: 'payment', header: 'Payment', render: (item: Order) => (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
              item.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {item.payment_status}
            </span>
          )},
          { key: 'date', header: 'Date', render: (item: Order) => (
            <span className="text-slate-500 font-mono text-xs">{new Date(item.created_at).toLocaleDateString()}</span>
          )},
        ]}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={orders.length}
      />
    </div>
  );
};
