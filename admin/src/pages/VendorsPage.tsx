import React, { useState, useEffect } from 'react';
import { Search, Eye, X } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

interface VendorData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  store_name?: string;
  products_count?: number;
  total_sales?: number;
}

export const VendorsPage: React.FC<{ apiFetch: ApiFetch }> = ({ apiFetch }) => {
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);
  const itemsPerPage = 8;

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        params.set('role', 'vendor');
        const data = await apiFetch(`/admin/users?${params.toString()}`);
        setVendors(data.data || []);
        setCurrentPage(1);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiFetch, searchQuery]);

  const totalPages = Math.ceil(vendors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVendors = vendors.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Vendors" subtitle="Manage vendor accounts and stores" />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search vendors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
        />
      </div>

      <DataTable
        data={currentVendors}
        columns={[
          { key: 'vendor', header: 'Vendor', render: (item: VendorData) => (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                {item.name?.charAt(0).toUpperCase() || 'V'}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{item.store_name || item.name}</p>
                <p className="text-xs text-slate-500">{item.name}</p>
              </div>
            </div>
          )},
          { key: 'email', header: 'Email', render: (item: VendorData) => <span className="text-slate-600 text-sm">{item.email}</span> },
          { key: 'products', header: 'Products', render: (item: VendorData) => (
            <span className="font-mono text-sm text-slate-700 font-medium">{item.products_count ?? '-'}</span>
          )},
          { key: 'sales', header: 'Total Sales', render: (item: VendorData) => (
            <span className="font-mono text-sm text-slate-700 font-medium">
              {item.total_sales != null ? `Rs. ${Number(item.total_sales).toLocaleString()}` : '-'}
            </span>
          )},
          { key: 'status', header: 'Status', render: (item: VendorData) => (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
              item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {item.status}
            </span>
          )},
          { key: 'actions', header: 'Actions', className: 'text-right', render: (item: VendorData) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => setSelectedVendor(item)}
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
        totalItems={vendors.length}
      />

      {selectedVendor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedVendor(null)}>
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Vendor Details</h3>
              <button onClick={() => setSelectedVendor(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-lg font-bold text-slate-900">{selectedVendor.store_name || selectedVendor.name}</p>
                <p className="text-sm text-slate-500">{selectedVendor.name} · {selectedVendor.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Products</p>
                  <p className="font-bold text-slate-900">{selectedVendor.products_count ?? '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Total Sales</p>
                  <p className="font-bold text-slate-900">
                    {selectedVendor.total_sales != null ? `Rs. ${Number(selectedVendor.total_sales).toLocaleString()}` : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
