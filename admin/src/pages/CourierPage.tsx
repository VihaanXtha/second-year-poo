import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';

interface CourierInfo {
  id: number;
  title: string;
  body: string;
  delivery_zones?: string[];
}

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

export function CourierPage({ apiFetch }: { apiFetch: ApiFetch }) {
  const [info, setInfo] = useState<CourierInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', delivery_zones: '' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/content/courier');
      setInfo(data.courier || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [apiFetch]);

  const openCreate = () => {
    setForm({ title: '', body: '', delivery_zones: '' });
    setOpenModal(true);
  };

  const openEdit = () => {
    if (!info) return;
    setForm({
      title: info.title,
      body: info.body,
      delivery_zones: Array.isArray(info.delivery_zones) ? info.delivery_zones.join('\n') : '',
    });
    setOpenModal(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { ...form };
      payload.delivery_zones = payload.delivery_zones ? payload.delivery_zones.split('\n').filter(Boolean) : [];
      if (info) {
        await apiFetch(`/admin/content/courier/${info.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/admin/content/courier', { method: 'POST', body: JSON.stringify(payload) });
      }
      setOpenModal(false);
      await load();
    } catch (e) {
      console.error(e);
      alert('Failed to save courier info');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!info || !confirm('Delete courier info?')) return;
    try {
      await apiFetch(`/admin/content/courier/${info.id}`, { method: 'DELETE' });
      setInfo(null);
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
      <PageHeader title="Courier Info" subtitle="Manage delivery information" actionLabel={info ? 'Edit Courier Info' : 'Add Courier Info'} onAction={info ? openEdit : openCreate} />

      {info ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{info.title}</h3>
              <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{info.body}</p>
              {info.delivery_zones && info.delivery_zones.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Delivery Zones</p>
                  <div className="flex flex-wrap gap-2">
                    {info.delivery_zones.map((zone, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-700">{zone}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={handleDelete} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <p className="text-slate-500">No courier info configured. Click "Add Courier Info" to create one.</p>
        </div>
      )}

      <Modal open={openModal} onClose={() => setOpenModal(false)} title={info ? 'Edit Courier Info' : 'New Courier Info'} footer={
        <>
          <button onClick={() => setOpenModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={submit} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </>
      }>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Body</label>
            <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={6} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Zones (one per line)</label>
            <textarea value={form.delivery_zones} onChange={e => setForm({ ...form, delivery_zones: e.target.value })} rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
        </form>
      </Modal>
    </div>
  );
}
