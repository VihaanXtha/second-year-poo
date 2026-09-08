import React, { useState, useEffect } from 'react';
import { Search, Eye, X, Store, Check, XCircle, UserPlus, Pencil } from 'lucide-react';
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
  description?: string;
  address?: string;
  phone?: string;
  pan_number?: string;
  country?: string;
  province?: string;
  district?: string;
  municipality?: string;
  ward?: string;
  postal_code?: string;
  user_phone?: string;
  user_address?: string;
  user_city?: string;
  user_province?: string;
  user_district?: string;
  user_municipality?: string;
  user_ward?: string;
  user_postal_code?: string;
  user_country?: string;
}

interface VendorApplication {
  id: number;
  user_id: number;
  store_name: string;
  description?: string;
  address?: string;
  phone?: string;
  status: string;
  verified: boolean;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    email_verified_at?: string | null;
  };
}

export const VendorsPage: React.FC<{ apiFetch: ApiFetch }> = ({ apiFetch }) => {
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<VendorApplication | null>(null);
  const [editingApplication, setEditingApplication] = useState<VendorApplication | null>(null);
  const [editForm, setEditForm] = useState({ store_name: '', description: '', address: '', phone: '' });
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [loadingApps, setLoadingApps] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const itemsPerPage = 8;

  const loadVendors = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      params.set('role', 'vendor');
      const data = await apiFetch(`/admin/users?${params.toString()}`);
      setVendors(data.data || []);
      setCurrentPage(1);
    } catch (e) {
      console.error(e);
    }
  };

  const loadApplications = async () => {
    setLoadingApps(true);
    try {
      const data = await apiFetch('/admin/vendor-applications');
      setApplications(data.data || []);
      setApplicationsCount(data.data?.length || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await loadVendors();
      await loadApplications();
      setLoading(false);
    };
    load();
  }, [apiFetch, searchQuery]);

  const handleApprove = async (applicationId: number) => {
    try {
      await apiFetch(`/admin/vendor-applications/${applicationId}/approve`, { method: 'POST' });
      await loadApplications();
      await loadVendors();
    } catch (e) {
      console.error(e);
      alert('Failed to approve vendor');
    }
  };

  const handleReject = async (applicationId: number) => {
    if (!confirm('Reject this vendor application?')) return;
    try {
      await apiFetch(`/admin/vendor-applications/${applicationId}/reject`, { method: 'POST' });
      await loadApplications();
    } catch (e) {
      console.error(e);
      alert('Failed to reject vendor');
    }
  };

  const handleEdit = (app: VendorApplication) => {
    setEditingApplication(app);
    setEditForm({
      store_name: app.store_name,
      description: app.description || '',
      address: app.address || '',
      phone: app.phone || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingApplication) return;
    try {
      await apiFetch(`/admin/vendor-applications/${editingApplication.id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      setEditingApplication(null);
      await loadApplications();
    } catch (e) {
      console.error(e);
      alert('Failed to update application');
    }
  };

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
      <div className="flex items-center justify-between">
        <PageHeader title="Vendors" subtitle="Manage vendor accounts and stores" />
        <button
          onClick={() => setShowApplications(true)}
          className="relative inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Vendor Applications
          {applicationsCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-red-700 border border-red-200">
              {applicationsCount}
            </span>
          )}
        </button>
      </div>

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

      {/* Vendor Applications Modal */}
      {showApplications && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowApplications(false)}>
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Vendor Applications</h3>
                <p className="text-sm text-slate-500">{applicationsCount} pending applications</p>
              </div>
              <button onClick={() => setShowApplications(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {loadingApps ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                </div>
              ) : applications.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No pending applications.</p>
              ) : (
                <div className="space-y-4">
                   {applications.map((app) => (
                     <div key={app.id} className="rounded-xl border border-slate-200 p-4">
                       <div className="flex items-start justify-between">
                         <div>
                           <p className="font-semibold text-slate-900">{app.store_name}</p>
                           <p className="text-sm text-slate-500">{app.user.name} · {app.user.email}</p>
                           {app.description && <p className="text-sm text-slate-600 mt-1">{app.description}</p>}
                           {app.address && <p className="text-xs text-slate-500 mt-1">Address: {app.address}</p>}
                           {app.phone && <p className="text-xs text-slate-500">Phone: {app.phone}</p>}
                         </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedApplication(app)}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              See
                            </button>
                            <button
                              onClick={() => handleEdit(app)}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-200 transition-colors"
                            >
                              <Pencil className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleApprove(app.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(app.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                            >
                              <XCircle className="w-3 h-3" />
                              Reject
                            </button>
                          </div>
                       </div>
                     </div>
                   ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedApplication(null)}>
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Application Details</h3>
              <button onClick={() => setSelectedApplication(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-lg font-bold text-slate-900">{selectedApplication.store_name}</p>
                <p className="text-sm text-slate-500">{selectedApplication.user.name} · {selectedApplication.user.email}</p>
              </div>
              <div className="space-y-2 text-sm">
                {selectedApplication.description && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Description</p>
                    <p className="text-slate-900">{selectedApplication.description}</p>
                  </div>
                )}
                {selectedApplication.address && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Address</p>
                    <p className="text-slate-900">{selectedApplication.address}</p>
                  </div>
                )}
                {selectedApplication.phone && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Phone</p>
                    <p className="text-slate-900">{selectedApplication.phone}</p>
                  </div>
                )}
                {selectedApplication.user.email_verified_at && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Email Status</p>
                    <p className="text-slate-900">Verified</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <button onClick={() => setSelectedApplication(null)} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingApplication && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingApplication(null)}>
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Edit Application</h3>
              <button onClick={() => setEditingApplication(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Store Name</label>
                <input
                  type="text"
                  value={editForm.store_name}
                  onChange={(e) => setEditForm({ ...editForm, store_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setEditingApplication(null)} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSaveEdit} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedVendor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedVendor(null)}>
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-xl" onClick={e => e.stopPropagation()}>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Status</p>
                  <p className="font-bold text-slate-900">{selectedVendor.status}</p>
                </div>
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
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Phone</p>
                  <p className="font-bold text-slate-900">{selectedVendor.phone || selectedVendor.user_phone || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Store Address</p>
                  <p className="font-bold text-slate-900">{selectedVendor.address || selectedVendor.user_address || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Country</p>
                  <p className="font-bold text-slate-900">{selectedVendor.country || selectedVendor.user_country || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Province</p>
                  <p className="font-bold text-slate-900">{selectedVendor.province || selectedVendor.user_province || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">District</p>
                  <p className="font-bold text-slate-900">{selectedVendor.district || selectedVendor.user_district || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Municipality</p>
                  <p className="font-bold text-slate-900">{selectedVendor.municipality || selectedVendor.user_municipality || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Ward</p>
                  <p className="font-bold text-slate-900">{selectedVendor.ward || selectedVendor.user_ward || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Postal Code</p>
                  <p className="font-bold text-slate-900">{selectedVendor.postal_code || selectedVendor.user_postal_code || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Description</p>
                  <p className="font-bold text-slate-900">{selectedVendor.description || '-'}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={() => setSelectedVendor(null)} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
