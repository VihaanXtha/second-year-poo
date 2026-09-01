import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { OrderItem } from '../types';

interface OrdersTableProps {
  data: OrderItem[];
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(
      (item) =>
        item.customerName.toLowerCase().includes(q) ||
        item.orderId.toLowerCase().includes(q) ||
        item.product.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const statusColors = {
    Pending: 'bg-amber-100 text-amber-700',
    Processing: 'bg-blue-100 text-blue-700',
    Shipped: 'bg-purple-100 text-purple-700',
    Delivered: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="rounded-2xl border border-[#1e293b] bg-[#0f172a] shadow-lg">
      <div className="p-5 border-b border-[#1e293b] flex items-center justify-between">
        <h3 className="text-sm uppercase tracking-[0.2em] text-slate-500 font-mono">
          Recent Orders
        </h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="bg-[#1e293b] border border-[#33415b] rounded-xl pl-8 pr-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#dc2626] w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#1e293b] bg-[#1e293b]/30">
              <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Order</th>
              <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Customer</th>
              <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Product</th>
              <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Date</th>
              <th className="px-5 py-3 text-right text-xs font-mono uppercase tracking-wider text-slate-500">Amount</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-500 text-sm">
                  No orders found matching "{searchQuery}"
                </td>
              </tr>
            ) : (
              currentData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[#1e293b]/50 hover:bg-[#1e293b]/30 transition-colors"
                >
                  <td className="px-5 py-3 font-mono text-xs text-slate-400">{item.orderId}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.customerAvatar}
                        alt={item.customerName}
                        className="w-7 h-7 rounded-full object-cover border border-[#33415b]"
                      />
                      <span className="font-medium text-white">{item.customerName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-300">{item.product}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-mono ${
                        statusColors[item.status] || 'bg-slate-500/20 text-slate-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 font-mono text-xs">{item.date}</td>
                  <td className="px-5 py-3 text-right font-mono font-bold text-white">
                    {item.amount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredData.length > 0 && (
        <div className="p-4 border-t border-[#1e293b] flex items-center justify-between text-xs font-mono text-slate-500">
          <span>
            Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-[#1e293b] text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:text-slate-300"
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
                    : 'border-[#1e293b] text-slate-500 hover:text-slate-300'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded border border-[#1e293b] text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:text-slate-300"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
