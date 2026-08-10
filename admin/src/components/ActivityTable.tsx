import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { ActivityItem } from '../types';

interface ActivityTableProps {
  data: ActivityItem[];
}

export const ActivityTable: React.FC<ActivityTableProps> = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(
      (item) =>
        item.userName.toLowerCase().includes(q) ||
        item.action.toLowerCase().includes(q) ||
        item.target.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-lg">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm uppercase tracking-[0.2em] text-slate-500 font-mono">
          Recent Activity
        </h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search activity..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#dc2626] transition-colors w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/30">
              <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">User</th>
              <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Action</th>
              <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-500 text-sm">
                  No activity found matching "{searchQuery}"
                </td>
              </tr>
            ) : (
              currentData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.userAvatar}
                        alt={item.userName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <p className="font-medium text-white">{item.userName}</p>
                        <p className="text-xs text-slate-500 font-mono">{item.time}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-300">
                    <div>
                      <span className="font-medium">{item.action}</span>{' '}
                      <span className="text-slate-500 font-mono text-xs">{item.target}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-mono ${item.statusColor}`}
                    >
                      {item.status}
                    </span>
                  </td>
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
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>
            Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded border border-slate-800 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:text-slate-300"
            >
              «
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
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
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded border border-slate-800 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:text-slate-300"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
