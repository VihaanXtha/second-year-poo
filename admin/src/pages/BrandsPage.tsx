import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { Tag, Upload, X } from 'lucide-react';

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  status: 'active' | 'inactive';
}

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

export function BrandsPage({ apiFetch }: { apiFetch: ApiFetch }) {
  const [items, setItems] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', logo: '', status: 'active' as Brand['status'] });
  const [uploading, setUploading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/brands');
      setItems(data.brands || data || []);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [apiFetch]);

  const startCreate = () => {
    setEditing(-1);
    setForm({ name: '', slug: '', logo: '', status: 'active' });
  };

  const startEdit = (item: Brand) => {
    setEditing(item.id);
    setForm({ name: item.name, slug: item.slug, logo: item.logo || '', status: item.status });
  };

  const cancel = () => {
    setEditing(null);
    setForm({ name: '', slug: '', logo: '', status: 'active' });
  };

  const save = async () => {
    if (!form.name.trim() || !form.slug.trim()) return;
    setSaving(editing === -1 ? -999 : editing);
    try {
      if (editing === -1) {
        await apiFetch('/admin/brands', { method: 'POST', body: JSON.stringify(form) });
      } else if (editing && editing > 0) {
        await apiFetch(`/admin/brands/${editing}`, { method: 'PUT', body: JSON.stringify(form) });
      }
      await load();
      cancel();
    } catch (e) {
      console.error(e);
      alert('Failed to save brand');
    } finally {
      setSaving(null);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this brand?')) return;
    try {
      await apiFetch(`/admin/brands/${id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      console.error(e);
      alert('Failed to delete');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const data = await apiFetch('/admin/brands/upload-logo', { method: 'POST', body: formData });
      setForm({ ...form, logo: data.url });
    } catch (err) {
      console.error(err);
      alert('Logo upload failed');
    } finally {
      setUploading(false);
      setFileInputKey(k => k + 1);
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
      <PageHeader
        title="Brands"
        subtitle="Manage product brands."
        actionLabel="Add Brand"
        onAction={startCreate}
      />

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <DataTable
          data={items}
          columns={[
            { key: 'name', header: 'Name', render: (item: Brand) => <span className="font-medium text-slate-900">{item.name}</span> },
            { key: 'slug', header: 'Slug', render: (item: Brand) => <span className="font-mono text-xs text-slate-500">{item.slug}</span> },
            { key: 'logo', header: 'Logo', render: (item: Brand) => item.logo ? <img src={item.logo} alt={item.name} className="h-8 w-8 object-contain rounded border border-slate-200" /> : <span className="text-xs text-slate-400">-</span> },
            { key: 'status', header: 'Status', render: (item: Brand) => (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{item.status}</span>
            )},
            {
              key: 'actions',
              header: 'Actions',
              render: (item: Brand) => (
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(item)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">Edit</button>
                  <button onClick={() => remove(item.id)} className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
                </div>
              ),
            },
          ]}
          title={`${items.length} Brands`}
          searchable={false}
          currentPage={1}
          setCurrentPage={() => {}}
          totalPages={1}
          startIndex={0}
          endIndex={items.length}
          totalItems={items.length}
        />
      </div>

      {editing !== null && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">{editing === -1 ? 'Add Brand' : 'Edit Brand'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. Asus" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. asus" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Logo URL</label>
              <div className="flex items-center gap-2">
                <input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="https://..." />
                <label className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Upload className="w-3.5 h-3.5" />
                  {uploading ? 'Uploading...' : 'Upload'}
                  <input key={fileInputKey} type="file" accept="image/svg+xml,image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoUpload} />
                </label>
              </div>
              {form.logo && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={form.logo} alt="preview" className="h-10 w-10 object-contain rounded border border-slate-200 bg-white" />
                  <button type="button" onClick={() => setForm({ ...form, logo: '' })} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                    <X className="w-3 h-3" /> Remove
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Brand['status'] })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button onClick={save} disabled={saving !== null} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-50">{saving !== null ? 'Saving...' : 'Save'}</button>
            <button onClick={cancel} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
