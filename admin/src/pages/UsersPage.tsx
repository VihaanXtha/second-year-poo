import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit, Trash2, Eye, X, Store, Users, Shield } from 'lucide-react';

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
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email_verified_at?: string | null;
}

type RoleTab = 'vendors' | 'customers' | 'admins' | 'all';

const ROLE_TABS: { id: RoleTab; label: string; icon: React.ReactNode; role: string | null; color: string }[] = [
  { id: 'vendors', label: 'Vendors', icon: <Store className="w-4 h-4" />, role: 'vendor', color: 'text-blue-400' },
  { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" />, role: 'customer', color: 'text-slate-400' },
  { id: 'admins', label: 'Admins', icon: <Shield className="w-4 h-4" />, role: 'admin', color: 'text-purple-400' },
];

export const UsersPage: React.FC<{ apiFetch: ApiFetch }> = ({ apiFetch }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<RoleTab>('all');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const itemsPerPage = 8;

  useEffect(() => {
    setLoading(true);
    const load = async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);

        // Filter by role based on active sub-page tab
        const activeRole = ROLE_TABS.find(t => t.id === activeTab)?.role;
        if (activeRole) params.set('role', activeRole);

        const data = await apiFetch(`/admin/users?${params.toString()}`);
        setUsers(data.data || []);
        setCurrentPage(1);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiFetch, searchQuery, activeTab]);

  const filteredUsers = users.filter((user) => {
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter.toLowerCase();
    return matchesStatus;
  });

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

      {/* Sub-Page Tabs: Vendors / Customers / Admins */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-mono transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#dc2626]/15 text-[#dc2626] border border-[#dc2626]/30'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          All Users
        </button>
        {ROLE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-mono flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#dc2626]/15 text-[#dc2626] border border-[#dc2626]/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span className={tab.color}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            <option value="All" className="bg-slate-800">All Status</option>
            <option value="Active" className="bg-slate-800">Active</option>
            <option value="Inactive" className="bg-slate-800">Inactive</option>
            <option value="Banned" className="bg-slate-800">Banned</option>
          </select>
        </div>
      </div>

      {/* Role Label Header */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
          {activeTab === 'all' ? 'All Users' : `${ROLE_TABS.find(t => t.id === activeTab)?.label} (${users.length})`}
        </span>
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
              {currentUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500 text-sm">
                    No {activeTab !== 'all' ? ROLE_TABS.find(t => t.id === activeTab)?.label.toLowerCase() : ''} users found.
                  </td>
                </tr>
              )}
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
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-1 text-slate-500 hover:text-sky-400 rounded transition-colors cursor-pointer"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
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

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <img src={`https://i.pravatar.cc/64?u=${selectedUser.id}`} alt={selectedUser.name} className="w-16 h-16 rounded-full object-cover border border-slate-700" />
                <div>
                  <p className="text-lg font-bold text-white">{selectedUser.name}</p>
                  <p className="text-sm text-slate-400">{selectedUser.email}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-mono ${
                    selectedUser.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                    selectedUser.role === 'vendor' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">Status</p>
                  <p className={`font-medium ${selectedUser.status === 'active' ? 'text-green-400' : selectedUser.status === 'banned' ? 'text-red-400' : 'text-slate-300'}`}>
                    {selectedUser.status}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">Phone</p>
                  <p className="font-medium text-slate-200">{selectedUser.phone || '—'}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">Address</p>
                  <p className="font-medium text-slate-200">{selectedUser.address || '—'}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">City</p>
                  <p className="font-medium text-slate-200">{selectedUser.city || '—'}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">Postal Code</p>
                  <p className="font-medium text-slate-200">{selectedUser.postal_code || '—'}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">Country</p>
                  <p className="font-medium text-slate-200">{selectedUser.country || '—'}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">Email Verified</p>
                  <p className={`font-medium ${selectedUser.email_verified_at ? 'text-green-400' : 'text-amber-400'}`}>
                    {selectedUser.email_verified_at ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">Joined</p>
                  <p className="font-medium text-slate-200">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};