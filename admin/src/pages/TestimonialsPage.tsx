import React, { useEffect, useState } from 'react';
import { Search, Plus, Eye, Trash2, X, Star } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';

interface Testimonial {
  id: number;
  name: string;
  role?: string;
  company?: string;
  content: string;
  photo?: string;
  rating: number;
  is_published: boolean;
  created_at: string;
}

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

export function TestimonialsPage({ apiFetch }: { apiFetch: ApiFetch }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({ name: '', role: '', company: '', content: '', photo: '', rating: 5, is_published: true });

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/testimonials');
      setTestimonials(data.testimonials || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [apiFetch]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', role: '', company: '', content: '', photo: '', rating: 5, is_published: true });
    setOpenModal(true);
  };

  const openEdit = (testimonial: Testimonial) => {
    setEditing(testimonial);
    setForm({
      name: testimonial.name,
      role: testimonial.role || '',
      company: testimonial.company || '',
      content: testimonial.content,
      photo: testimonial.photo || '',
      rating: testimonial.rating || 5,
      is_published: testimonial.is_published,
    });
    setOpenModal(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (editing) {
        await apiFetch(`/admin/testimonials/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/admin/testimonials', { method: 'POST', body: JSON.stringify(payload) });
      }
      setOpenModal(false);
      await load();
    } catch (e) {
      console.error(e);
      alert('Failed to save testimonial');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await apiFetch(`/admin/testimonials/${id}`, { method: 'DELETE' });
      await load();
      if (selectedTestimonial?.id === id) setSelectedTestimonial(null);
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
      <PageHeader title="Testimonials" subtitle="Manage customer testimonials" actionLabel="Add Testimonial" onAction={openCreate} />

      <DataTable
        data={testimonials}
        columns={[
          { key: 'name', header: 'Name', render: (item: Testimonial) => <span className="font-semibold text-slate-900 text-sm">{item.name}</span> },
          { key: 'company', header: 'Company', render: (item: Testimonial) => <span className="text-slate-600 text-sm">{item.company || '-'}</span> },
          { key: 'rating', header: 'Rating', render: (item: Testimonial) => (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
              ))}
            </div>
          )},
          { key: 'is_published', header: 'Status', render: (item: Testimonial) => (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${item.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
              {item.is_published ? 'Published' : 'Draft'}
            </span>
          )},
          { key: 'actions', header: 'Actions', className: 'text-right', render: (item: Testimonial) => (
            <div className="flex items-center justify-end gap-1">
              <button onClick={() => setSelectedTestimonial(item)} className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-red-50 transition-colors"><Eye className="w-4 h-4" /></button>
              <button onClick={() => openEdit(item)} className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-red-50 transition-colors"><Eye className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          )},
        ]}
        currentPage={1}
        setCurrentPage={() => {}}
        totalPages={1}
        startIndex={0}
        endIndex={testimonials.length}
        totalItems={testimonials.length}
      />

      <Modal open={openModal} onClose={() => setOpenModal(false)} title={editing ? 'Edit Testimonial' : 'New Testimonial'} footer={
        <>
          <button onClick={() => setOpenModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={submit} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </>
      }>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <input type="text" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
              <input type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Photo URL</label>
            <input type="text" value={form.photo} onChange={e => setForm({ ...form, photo: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
            <select value={form.rating} onChange={e => setForm({ ...form, rating: parseInt(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary">
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_published" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
            <label htmlFor="is_published" className="text-sm text-slate-700">Published</label>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {selectedTestimonial && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTestimonial(null)}>
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Testimonial Details</h3>
              <button onClick={() => setSelectedTestimonial(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                {selectedTestimonial.photo && (
                  <img src={selectedTestimonial.photo} alt={selectedTestimonial.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                )}
                <div>
                  <p className="text-lg font-bold text-slate-900">{selectedTestimonial.name}</p>
                  <p className="text-sm text-slate-500">{selectedTestimonial.role} {selectedTestimonial.company && `at ${selectedTestimonial.company}`}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < selectedTestimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">{selectedTestimonial.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
