import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X, Pencil } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';

interface HomepageSlider {
  id: number;
  image_url: string;
  headline: string;
  link_url?: string;
  sort_order: number;
  is_active: boolean;
}

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

export function SlidersPage({ apiFetch }: { apiFetch: ApiFetch }) {
  const [sliders, setSliders] = useState<HomepageSlider[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<HomepageSlider | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{ image_url: string; headline: string; link_url?: string; sort_order: number; is_active: boolean }>({ image_url: '', headline: '', link_url: '', sort_order: 0, is_active: true });

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/content/sliders');
      setSliders(data.sliders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [apiFetch]);

  const openCreate = () => {
    setEditing(null);
    setForm({ image_url: '', headline: '', link_url: '', sort_order: 0, is_active: true });
    setOpenModal(true);
  };

  const openEdit = (slider: HomepageSlider) => {
    setEditing(slider);
    setForm({
      image_url: slider.image_url,
      headline: slider.headline,
      link_url: slider.link_url || '',
      sort_order: slider.sort_order,
      is_active: slider.is_active,
    });
    setOpenModal(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.link_url) delete payload.link_url;
      if (editing) {
        await apiFetch(`/admin/content/sliders/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/admin/content/sliders', { method: 'POST', body: JSON.stringify(payload) });
      }
      setOpenModal(false);
      await load();
    } catch (e) {
      console.error(e);
      alert('Failed to save slider');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this slider?')) return;
    try {
      await apiFetch(`/admin/content/sliders/${id}`, { method: 'DELETE' });
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
      <PageHeader title="Homepage Sliders" subtitle="Manage hero carousel slides" actionLabel="Add Slider" onAction={openCreate} />

      <DataTable
        data={sliders}
        columns={[
          { key: 'headline', header: 'Headline', render: (item: HomepageSlider) => <span className="font-semibold text-slate-900 text-sm">{item.headline}</span> },
          { key: 'image_url', header: 'Image', render: (item: HomepageSlider) => (
            <img src={item.image_url} alt={item.headline} className="h-10 w-16 object-cover rounded-lg" />
          )},
          { key: 'link_url', header: 'Link', render: (item: HomepageSlider) => <span className="text-slate-600 text-xs">{item.link_url || '-'}</span> },
          { key: 'sort_order', header: 'Order', render: (item: HomepageSlider) => <span className="font-mono text-sm text-slate-600">{item.sort_order}</span> },
          { key: 'is_active', header: 'Status', render: (item: HomepageSlider) => (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
              {item.is_active ? 'Active' : 'Inactive'}
            </span>
          )},
          { key: 'actions', header: 'Actions', className: 'text-right', render: (item: HomepageSlider) => (
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
        endIndex={sliders.length}
        totalItems={sliders.length}
      />

      <Modal open={openModal} onClose={() => setOpenModal(false)} title={editing ? 'Edit Slider' : 'New Slider'} footer={
        <>
          <button onClick={() => setOpenModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={submit} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </>
      }>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Headline</label>
            <input type="text" value={form.headline} onChange={e => setForm({ ...form, headline: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
            <input type="text" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Link URL</label>
            <input type="text" value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sort Order</label>
            <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
            <label htmlFor="is_active" className="text-sm text-slate-700">Active</label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
