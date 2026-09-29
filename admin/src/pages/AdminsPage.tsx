import React, { useState, useEffect } from 'react';
import { Search, Eye, X, Shield, Plus, Trash2, Pencil } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

interface AdminData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  email_verified_at?: string | null;
}

export const AdminsPage: React.FC<{ apiFetch: ApiFetch }> = ({ apiFetch }) => {
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminData | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', status: 'active' });
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '', password_confirmation: '', status: 'active' });
  const itemsPerPage = 8;

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      params.set('role', 'admin');
      const data = await apiFetch(`/admin/users?${params.toString()}`);
      setAdmins(data.data || []);
      setCurrentPage(1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [apiFetch, searchQuery]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setOpenModal(false);
      setForm({ name: '', email: '', password: '', password_confirmation: '', status: 'active' });
      await load();
    } catch (e) {
      console.error(e);
      alert('Failed to create admin');
    } finally {
      setSaving(false);
    }
  };

    const handleDelete = async (id: number) => {
    if (!confirm('Delete this admin? This action cannot be undone.')) return;
    try {
      await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
      await load();
      if (selectedAdmin?.id === id) setSelectedAdmin(null);
    } catch (e) {
      console.error(e);
      alert('Failed to delete admin');
    }
  };

  const toggleAdminStatus = async (admin: AdminData) => {
    const newStatus = admin.status === 'active' ? 'inactive' : 'active';
    try {
      await apiFetch(`/admin/users/${admin.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setAdmins(admins.map(a => a.id === admin.id ? { ...a, status: newStatus } : a));
    } catch (e) {
      console.error(e);
      alert('Failed to update admin status');
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
        if (!selectedAdmin) return;
    setSaving(true);
    try {
      const payload: any = {
        name: editForm.name,
        email: editForm.email,
        status: editForm.status,
      };
      if (editForm.password) {
        payload.password = editForm.password;
        payload.password_confirmation = editForm.password_confirmation;
      }
      await apiFetch(`/admin/users/${selectedAdmin.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      await load();
      setSelectedAdmin(null);
    } catch (e) {
      console.error(e);
      alert('Failed to update admin');
        } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(admins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAdmins = admins.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Admins" subtitle="Manage admin accounts" actionLabel="Create Admin" onAction={() => setOpenModal(true)} />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search admins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
        />
      </div>

      <DataTable
        data={currentAdmins}
        columns={[
          { key: 'admin', header: 'Admin', render: (item: AdminData) => (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                {item.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="font-semibold text-slate-900 text-sm">{item.name}</span>
            </div>
          )},
          { key: 'email', header: 'Email', render: (item: AdminData) => <span className="text-slate-600 text-sm">{item.email}</span> },
                    { key: 'status', header: 'Status', render: (item: AdminData) => (
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {item.status}
              </span>
              <button
                onClick={() => toggleAdminStatus(item)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                  item.status === 'active' ? 'bg-green-500' : 'bg-slate-300'
                }`}
                title={item.status === 'active' ? 'Deactivate' : 'Activate'}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    item.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )},
          { key: 'created_at', header: 'Joined', render: (item: AdminData) => (
            <span className="text-slate-500 font-mono text-xs">{new Date(item.created_at).toLocaleDateString()}</span>
          )},
          { key: 'actions', header: 'Actions', className: 'text-right', render: (item: AdminData) => (
                        <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => { setEditForm({ name: item.name, email: item.email, password: '', password_confirmation: '', status: item.status }); setSelectedAdmin(item); }}
                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                title="Edit"
              >
                                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedAdmin(item)}
                className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-slate-50 transition-colors"
                title="View"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )},
        ]}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={admins.length}
      />

      {/* Create Admin Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Create Admin" footer={
        <>
          <button onClick={() => setOpenModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={handleCreate} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button>
        </>
      }>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
            <input type="password" value={form.password_confirmation} onChange={e => setForm({ ...form, password_confirmation: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Admin Details Modal */}
      {selectedAdmin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAdmin(null)}>
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Admin Details</h3>
              <button onClick={() => setSelectedAdmin(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg">
                  {selectedAdmin.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{selectedAdmin.name}</p>
                  <p className="text-sm text-slate-500">{selectedAdmin.email}</p>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                    selectedAdmin.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedAdmin.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Email Verified</p>
                  <p className={`font-semibold ${selectedAdmin.email_verified_at ? 'text-green-600' : 'text-amber-600'}`}>
                    {selectedAdmin.email_verified_at ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Joined</p>
                  <p className="font-semibold text-slate-700">{new Date(selectedAdmin.created_at).toLocaleDateString()}</p>
                </div>
                            </div>
              <form onSubmit={handleUpdateAdmin} className="space-y-4 border-t border-slate-100 pt-4">
                <h4 className="text-sm font-semibold text-slate-900">Edit Admin</h4>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                  <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Password (leave blank to keep current)</label>
                  <input type="password" value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                  <input type="password" value={editForm.password_confirmation} onChange={e => setEditForm({ ...editForm, password_confirmation: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
                <div className="flex gap-2">
                                    <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
                  <button type="button" onClick={() => setEditForm({ name: selectedAdmin.name, email: selectedAdmin.email, password: '', password_confirmation: '', status: selectedAdmin.status })} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Reset</button>
                </div>
              </form>
              <div className="pt-2">
                <button
                  onClick={() => handleDelete(selectedAdmin.id)}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
