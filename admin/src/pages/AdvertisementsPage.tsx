import React, { useEffect, useState } from 'react';
import { Trash2, Pencil } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';

type LinkType = 'product' | 'category' | 'subcategory' | 'external_url';

interface Advertisement {
  id: number;
  title?: string | null;
  image: string;
  link_type: LinkType;
  link_target_id?: number | null;
  external_url?: string | null;
  link_url?: string | null;
  link_label?: string | null;
  sort_order: number;
  is_active: boolean;
}

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

const LINK_TYPES: { value: LinkType; label: string }[] = [
  { value: 'product', label: 'Product' },
  { value: 'category', label: 'Category' },
  { value: 'subcategory', label: 'Subcategory' },
  { value: 'external_url', label: 'External URL' },
];

const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary';

export function AdvertisementsPage({ apiFetch }: { apiFetch: ApiFetch }) {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Advertisement | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', image: '', link_type: 'product' as LinkType, link_target_id: '', external_url: '', sort_order: 0, is_active: true });

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/content/advertisements');
      setAds(data.advertisements || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [apiFetch]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', image: '', link_type: 'product', link_target_id: '', external_url: '', sort_order: 0, is_active: true });
    setOpenModal(true);
  };

  const openEdit = (ad: Advertisement) => {
    setEditing(ad);
    setForm({
      title: ad.title || '',
      image: ad.image,
      link_type: ad.link_type,
      link_target_id: ad.link_target_id ? String(ad.link_target_id) : '',
      external_url: ad.external_url || '',
      sort_order: ad.sort_order,
      is_active: ad.is_active,
    });
    setOpenModal(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title || null,
        image: form.image,
        link_type: form.link_type,
        sort_order: form.sort_order,
        is_active: form.is_active,
      };
      if (form.link_type === 'external_url') {
        payload.external_url = form.external_url;
        payload.link_target_id = null;
      } else {
        payload.link_target_id = form.link_target_id ? parseInt(form.link_target_id) : null;
        payload.external_url = null;
      }
      const url = editing ? `/admin/content/advertisements/${editing.id}` : '/admin/content/advertisements';
      await apiFetch(url, { method: editing ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      setOpenModal(false);
      await load();
    } catch (e) {
      console.error(e);
      alert('Failed to save advertisement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this advertisement?')) return;
    try {
      await apiFetch(`/admin/content/advertisements/${id}`, { method: 'DELETE' });
      await load();
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
      <PageHeader title="Advertisements" subtitle="Manage homepage ad carousel cards" actionLabel="Add Advertisement" onAction={openCreate} />
      <DataTable
        data={ads}
        columns={[
          { key: 'image', header: 'Image', render: (item: Advertisement) => (
            <img src={item.image} alt={item.title || 'Ad'} className="h-10 w-20 rounded-lg object-cover border border-slate-200" />
          )},
          { key: 'title', header: 'Title', render: (item: Advertisement) => <span className="font-semibold text-slate-900 text-sm">{item.title || '—'}</span> },
          { key: 'link', header: 'Links to', render: (item: Advertisement) => (
            <span className="text-sm text-slate-600">{item.link_label || item.external_url || item.link_type}</span>
          )},
          { key: 'order', header: 'Order', render: (item: Advertisement) => <span className="text-sm text-slate-600">{item.sort_order}</span> },
          { key: 'is_active', header: 'Status', render: (item: Advertisement) => (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
              {item.is_active ? 'Active' : 'Inactive'}
            </span>
          )},
          { key: 'actions', header: 'Actions', className: 'text-right', render: (item: Advertisement) => (
            <div className="flex items-center justify-end gap-1">
              <button onClick={() => openEdit(item)} className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-red-50 transition-colors"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          )},
        ]}
        currentPage={1}
        setCurrentPage={() => {}}
        totalPages={1}
        startIndex={0}
        endIndex={ads.length}
        totalItems={ads.length}
      />

      <Modal open={openModal} onClose={() => setOpenModal(false)} title={editing ? 'Edit Advertisement' : 'New Advertisement'} footer={
        <>
          <button onClick={() => setOpenModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={submit} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </>
      }>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
            <input type="text" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className={inputCls} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Link type</label>
            <select value={form.link_type} onChange={e => setForm({ ...form, link_type: e.target.value as LinkType })} className={inputCls}>
              {LINK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          {form.link_type === 'external_url' ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">External URL</label>
              <input type="text" value={form.external_url} onChange={e => setForm({ ...form, external_url: e.target.value })} placeholder="https://…" className={inputCls} required />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target {form.link_type} ID</label>
              <input type="number" min={1} value={form.link_target_id} onChange={e => setForm({ ...form, link_target_id: e.target.value })} placeholder="product / category / subcategory id" className={inputCls} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sort Order</label>
            <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className={inputCls} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="ad_is_active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
            <label htmlFor="ad_is_active" className="text-sm text-slate-700">Active</label>
          </div>
        </form>
      </Modal>
    </div>
  );
}

