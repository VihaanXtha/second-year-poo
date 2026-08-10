import React, { useState, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface OrderData {
  id: number;
  order_number: string;
  status: string;
  total: number;
  payment_status: string;
  shipping_city: string;
  created_at: string;
  user: { name: string };
}

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

export const OrdersPage: React.FC<{ apiFetch: ApiFetch }> = ({ apiFetch }) => {
  const [orders, setOrders] = useState<OrderData[]>([]);
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

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return <div className="text-slate-400">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Orders</h2>
        <div className="flex items-center gap-3 text-sm font-mono">
          <span className="text-slate-400">Status:</span>
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                statusFilter === s
                  ? 'bg-[#dc2626] text-white'
                  : 'bg-[#1e293b] text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by order ID or customer..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#dc2626]"
        />
      </div>

      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/30">
                <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Order</th>
                <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Customer</th>
                <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Total</th>
                <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Payment</th>
                <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <tr key={order.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-slate-400">#{order.order_number}</td>
                  <td className="px-5 py-3">
                    <span className="font-medium text-white">{order.user?.name || 'Unknown'}</span>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`font-mono text-xs px-2.5 py-1 rounded-lg border-0 ${statusColors[order.status] || 'bg-slate-500/20 text-slate-400'} bg-transparent cursor-pointer`}
                    >
                      {Object.keys(statusColors).map((s) => (
                        <option key={s} value={s} className="text-xs">{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-right font-mono font-bold text-white">Rs. {Number(order.total).toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                      order.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 font-mono text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs font-mono text-slate-500">
          <span>
            Showing {startIndex + 1}-{Math.min(endIndex, orders.length)} of {orders.length} orders
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-slate-800 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:text-slate-300"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-2.5 py-1 rounded border ${
                  currentPage === page
                    ? 'bg-[#dc2626]/15 border-[#dc2626] text-[#dc2626] font-bold'
                    : 'border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded border border-slate-800 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:text-slate-300"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
