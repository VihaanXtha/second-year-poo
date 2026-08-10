import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Edit, Trash2, Ban, CheckCircle } from 'lucide-react';
import { User } from '../types';

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export const UsersPage: React.FC<{ apiFetch: ApiFetch }> = ({ apiFetch }) => {
  const [users, setUsers] = useState<UserData[]>([]);
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
        if (statusFilter !== 'All') params.set('role', statusFilter.toLowerCase());
        const data = await apiFetch(`/admin/users?${params.toString()}`);
        setUsers(data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiFetch, searchQuery, statusFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter.toLowerCase();
      return matchesStatus;
    });
  }, [users, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handleStatusChange = async (userId: number, status: string) => {
    try {
      await apiFetch(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="text-slate-400">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Users</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#dc2626]"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-sm font-mono text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-slate-800">All</option>
            <option value="Active" className="bg-slate-800">Active</option>
            <option value="Inactive" className="bg-slate-800">Inactive</option>
            <option value="Banned" className="bg-slate-800">Banned</option>
          </select>
        </div>
      </div>

      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/30">
                <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">User</th>
                <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Email</th>
                <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Role</th>
                <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Joined</th>
                <th className="px-5 py-3 text-right text-xs font-mono uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <img src={`https://i.pravatar.cc/40?u=${user.id}`} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                      <span className="font-medium text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-400">{user.email}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                      user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                      user.role === 'vendor' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      className={`px-2 py-0.5 rounded text-xs font-mono cursor-pointer ${
                        user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        user.status === 'banned' ? 'bg-red-500/20 text-red-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}
                    >
                      <option value="active" className="bg-slate-800">Active</option>
                      <option value="inactive" className="bg-slate-800">Inactive</option>
                      <option value="banned" className="bg-slate-800">Banned</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-slate-400 font-mono text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors cursor-pointer">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs font-mono text-slate-500">
          <span>
            Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
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
