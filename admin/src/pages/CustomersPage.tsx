import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Eye, X, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

interface CustomerData {
  id: number;
  name: string;
  email: string | null;
  role: string;
  status: string;
  created_at: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  district?: string | null;
  municipality?: string | null;
  ward?: string | null;
  postal_code?: string | null;
  country?: string | null;
  google_id?: string | number | null;
  auth_provider?: 'google' | 'email' | 'phone' | string;
  email_verified_at?: string | null;
  phone_verified_at?: string | null;
  linked_accounts?: { id: number; role: string }[];
}

interface Pager {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const PROVIDER_BADGE: Record<string, string> = {
  google: 'bg-blue-100 text-blue-700',
  email: 'bg-green-100 text-green-700',
  phone: 'bg-amber-100 text-amber-700',
};

const ROLE_LABEL: Record<string, string> = {
  customer: 'Customer',
  vendor: 'Vendor',
  admin: 'Admin',
};

const providerLabel = (c: CustomerData) =>
  c.auth_provider === 'google' ? 'Google' : c.email ? 'Email' : 'Phone';

export const CustomersPage: React.FC<{ apiFetch: ApiFetch }> = ({ apiFetch }) => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [pager, setPager] = useState<Pager>({ current_page: 1, last_page: 1, per_page: 8, total: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<CustomerData | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', status: 'active', password: '', password_confirmation: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const itemsPerPage = 8;

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      params.set('role', 'customer');
      params.set('page', String(currentPage));
      params.set('per_page', String(itemsPerPage));
      const data = await apiFetch(`/admin/users?${params.toString()}`);
      setCustomers(data.data || []);
      setPager({
        current_page: data.current_page || 1,
        last_page: Math.max(data.last_page || 1, 1),
        per_page: data.per_page || itemsPerPage,
        total: data.total || 0,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, debouncedSearch, currentPage]);

  useEffect(() => { load(); }, [load]);

  const openView = (c: CustomerData) => setSelectedCustomer(c);

  const openEdit = (c: CustomerData) => {
    setFormError('');
    setEditForm({
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      status: c.status || 'active',
      password: '',
      password_confirmation: '',
    });
    setEditingCustomer(c);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    if (editForm.password && editForm.password.length < 8) {
      setFormError('New password must be at least 8 characters.');
      return;
    }
    if (editForm.password && editForm.password !== editForm.password_confirmation) {
      setFormError('Password confirmation does not match.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload: Record<string, string> = {
        name: editForm.name,
        email: editForm.email,
        status: editForm.status,
      };
      if (editForm.phone) payload.phone = editForm.phone;
      if (editForm.password) {
        payload.password = editForm.password;
        payload.password_confirmation = editForm.password_confirmation;
      }
      await apiFetch(`/admin/users/${editingCustomer.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setEditingCustomer(null);
      await load();
      if (selectedCustomer?.id === editingCustomer.id) setSelectedCustomer(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this customer? Their orders and related data will be removed too. This cannot be undone.')) return;
    try {
      await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
      if (selectedCustomer?.id === id) setSelectedCustomer(null);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete customer');
    }
  };

  const startIndex = (pager.current_page - 1) * pager.per_page;
  const endIndex = startIndex + pager.per_page;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" subtitle="Manage customer accounts — email, phone and Google sign-ups" />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search name, email or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
        />
      </div>

      <DataTable
        data={customers}
        columns={[
          { key: 'customer', header: 'Customer', render: (item: CustomerData) => (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                {item.name?.charAt(0).toUpperCase() || 'C'}
              </div>
              <span className="font-semibold text-slate-900 text-sm">{item.name}</span>
            </div>
          )},
          { key: 'email', header: 'Email', render: (item: CustomerData) => <span className="text-slate-600 text-sm">{item.email || '—'}</span> },
          { key: 'provider', header: 'Login', render: (item: CustomerData) => {
            const key = item.auth_provider === 'google' ? 'google' : item.email ? 'email' : 'phone';
            return (
              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${PROVIDER_BADGE[key]}`}>
                {providerLabel(item)}
              </span>
            );
          }},
          { key: 'phone', header: 'Phone', render: (item: CustomerData) => <span className="text-slate-600 text-sm">{item.phone || '-'}</span> },
          { key: 'status', header: 'Status', render: (item: CustomerData) => (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
              item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {item.status}
            </span>
          )},
          { key: 'created_at', header: 'Joined', render: (item: CustomerData) => (
            <span className="text-slate-500 font-mono text-xs">{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</span>
          )},
          { key: 'actions', header: 'Actions', className: 'text-right', render: (item: CustomerData) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => openEdit(item)}
                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => openView(item)}
                className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-red-50 transition-colors"
                title="View"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )},
        ]}
        currentPage={pager.current_page}
        setCurrentPage={setCurrentPage}
        totalPages={pager.last_page}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={pager.total}
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
                  <p className="text-sm text-slate-500">{selectedCustomer.email || 'No email (phone signup)'}</p>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                    selectedCustomer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedCustomer.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Signed up with</p>
                  <p className="font-semibold text-slate-700">{providerLabel(selectedCustomer)}</p>
                </div>
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
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Phone Verified</p>
                  <p className={`font-semibold ${selectedCustomer.phone_verified_at ? 'text-green-600' : 'text-amber-600'}`}>
                    {selectedCustomer.phone_verified_at ? 'Yes' : 'No'}
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
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Province</p>
                  <p className="font-semibold text-slate-700">{selectedCustomer.province || '—'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Joined</p>
                  <p className="font-semibold text-slate-700">{selectedCustomer.created_at ? new Date(selectedCustomer.created_at).toLocaleDateString() : '—'}</p>
                </div>
              </div>
              {selectedCustomer.linked_accounts && selectedCustomer.linked_accounts.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-1">Also registered as (same email)</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCustomer.linked_accounts.map((account) => (
                      <span key={account.id} className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-white border border-blue-200 text-blue-700">
                        {ROLE_LABEL[account.role] || account.role} #{account.id}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleDelete(selectedCustomer.id)}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button
                  onClick={() => openEdit(selectedCustomer)}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingCustomer(null)}>
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Edit Customer</h3>
              <button onClick={() => setEditingCustomer(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">{formError}</div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="+97798XXXXXXXX" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password (leave blank to keep current)</label>
                <input type="password" value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              {editForm.password && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                  <input type="password" value={editForm.password_confirmation} onChange={e => setEditForm({ ...editForm, password_confirmation: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditingCustomer(null)} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
