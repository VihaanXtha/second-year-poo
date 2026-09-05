import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, X, Store, Users, Shield } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';

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

const ROLE_TABS = [
  { id: 'all' as RoleTab, label: 'All Users', icon: Users, role: null },
  { id: 'vendors' as RoleTab, label: 'Vendors', icon: Store, role: 'vendor' },
  { id: 'customers' as RoleTab, label: 'Customers', icon: Users, role: 'customer' },
  { id: 'admins' as RoleTab, label: 'Admins', icon: Shield, role: 'admin' },
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Users" subtitle="Manage all registered users" />

      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {ROLE_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-red-50 text-primary border border-red-100'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Banned">Banned</option>
          </select>
        </div>
      </div>

      <DataTable
        data={currentUsers}
        columns={[
          { key: 'user', header: 'User', render: (item: UserData) => (
            <div className="flex items-center gap-3">
              <img src={`https://i.pravatar.cc/40?u=${item.id}`} alt={item.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
              <span className="font-semibold text-slate-900 text-sm">{item.name}</span>
            </div>
          )},
          { key: 'email', header: 'Email', render: (item: UserData) => <span className="text-slate-600 text-sm">{item.email}</span> },
          { key: 'role', header: 'Role', render: (item: UserData) => (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
              item.role === 'admin' ? 'bg-purple-100 text-purple-700' :
              item.role === 'vendor' ? 'bg-blue-100 text-blue-700' :
              'bg-slate-100 text-slate-600'
            }`}>
              {item.role}
            </span>
          )},
          { key: 'status', header: 'Status', render: (item: UserData) => (
            <select
              value={item.status}
              onChange={(e) => handleStatusChange(item.id, e.target.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border-0 ${
                item.status === 'active' ? 'bg-green-100 text-green-700' :
                item.status === 'banned' ? 'bg-red-100 text-red-700' :
                'bg-slate-100 text-slate-600'
              }`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
          )},
          { key: 'created_at', header: 'Joined', render: (item: UserData) => (
            <span className="text-slate-500 font-mono text-xs">{new Date(item.created_at).toLocaleDateString()}</span>
          )},
          { key: 'actions', header: 'Actions', className: 'text-right', render: (item: UserData) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => setSelectedUser(item)}
                className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-red-50 transition-colors"
                title="View details"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          )},
        ]}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={filteredUsers.length}
      />

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">User Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <img src={`https://i.pravatar.cc/64?u=${selectedUser.id}`} alt={selectedUser.name} className="w-16 h-16 rounded-full object-cover border border-slate-200" />
                <div>
                  <p className="text-lg font-bold text-slate-900">{selectedUser.name}</p>
                  <p className="text-sm text-slate-500">{selectedUser.email}</p>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                    selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    selectedUser.role === 'vendor' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Status</p>
                  <p className={`font-semibold ${selectedUser.status === 'active' ? 'text-green-600' : selectedUser.status === 'banned' ? 'text-red-600' : 'text-slate-700'}`}>
                    {selectedUser.status}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Phone</p>
                  <p className="font-semibold text-slate-700">{selectedUser.phone || '—'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Address</p>
                  <p className="font-semibold text-slate-700">{selectedUser.address || '—'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">City</p>
                  <p className="font-semibold text-slate-700">{selectedUser.city || '—'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Email Verified</p>
                  <p className={`font-semibold ${selectedUser.email_verified_at ? 'text-green-600' : 'text-amber-600'}`}>
                    {selectedUser.email_verified_at ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Joined</p>
                  <p className="font-semibold text-slate-700">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
