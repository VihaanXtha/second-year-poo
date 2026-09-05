import React, { useState, useEffect } from 'react';
import { Search, Eye, X } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

interface CustomerData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  phone?: string;
  address?: string;
  city?: string;
  email_verified_at?: string | null;
}

export const CustomersPage: React.FC<{ apiFetch: ApiFetch }> = ({ apiFetch }) => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const itemsPerPage = 8;

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        params.set('role', 'customer');
        const data = await apiFetch(`/admin/users?${params.toString()}`);
        setCustomers(data.data || []);
        setCurrentPage(1);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiFetch, searchQuery]);

  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = customers.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" subtitle="Manage customer accounts" />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
        />
      </div>

      <DataTable
        data={currentCustomers}
        columns={[
          { key: 'customer', header: 'Customer', render: (item: CustomerData) => (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                {item.name?.charAt(0).toUpperCase() || 'C'}
              </div>
              <span className="font-semibold text-slate-900 text-sm">{item.name}</span>
            </div>
          )},
          { key: 'email', header: 'Email', render: (item: CustomerData) => <span className="text-slate-600 text-sm">{item.email}</span> },
          { key: 'phone', header: 'Phone', render: (item: CustomerData) => <span className="text-slate-600 text-sm">{item.phone || '-'}</span> },
          { key: 'status', header: 'Status', render: (item: CustomerData) => (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
              item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {item.status}
            </span>
          )},
          { key: 'created_at', header: 'Joined', render: (item: CustomerData) => (
            <span className="text-slate-500 font-mono text-xs">{new Date(item.created_at).toLocaleDateString()}</span>
          )},
          { key: 'actions', header: 'Actions', className: 'text-right', render: (item: CustomerData) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => setSelectedCustomer(item)}
                className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-red-50 transition-colors"
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
        totalItems={customers.length}
      />

      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedCustomer(null)}>
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Customer Details</h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                  {selectedCustomer.name?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{selectedCustomer.name}</p>
                  <p className="text-sm text-slate-500">{selectedCustomer.email}</p>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                    selectedCustomer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedCustomer.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Phone</p>
                  <p className="font-semibold text-slate-700">{selectedCustomer.phone || '—'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Email Verified</p>
                  <p className={`font-semibold ${selectedCustomer.email_verified_at ? 'text-green-600' : 'text-amber-600'}`}>
                    {selectedCustomer.email_verified_at ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Address</p>
                  <p className="font-semibold text-slate-700">{selectedCustomer.address || '—'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">City</p>
                  <p className="font-semibold text-slate-700">{selectedCustomer.city || '—'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Joined</p>
                  <p className="font-semibold text-slate-700">{new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
