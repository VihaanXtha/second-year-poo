import React, { useEffect, useState } from 'react';
import { Search, Plus, Eye, Trash2, X } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';

interface CareerPost {
  id: number;
  title: string;
  slug: string;
  description: string;
  requirements?: string[];
  is_published: boolean;
}

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

export function CareersPage({ apiFetch }: { apiFetch: ApiFetch }) {
  const [posts, setPosts] = useState<CareerPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<CareerPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '', description: '', requirements: '', is_published: false });

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/content/careers');
      setPosts(data.posts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [apiFetch]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', slug: '', description: '', requirements: '', is_published: false });
    setOpenModal(true);
  };

  const openEdit = (post: CareerPost) => {
    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug,
      description: post.description,
      requirements: Array.isArray(post.requirements) ? post.requirements.join('\n') : '',
      is_published: post.is_published,
    });
    setOpenModal(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { ...form };
      payload.requirements = payload.requirements ? payload.requirements.split('\n').filter(Boolean) : [];
      if (editing) {
        await apiFetch(`/admin/content/careers/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/admin/content/careers', { method: 'POST', body: JSON.stringify(payload) });
      }
      setOpenModal(false);
      await load();
    } catch (e) {
      console.error(e);
      alert('Failed to save career post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this career post?')) return;
    try {
      await apiFetch(`/admin/content/careers/${id}`, { method: 'DELETE' });
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
      <PageHeader title="Careers" subtitle="Manage job postings" actionLabel="Add Role" onAction={openCreate} />

      <DataTable
        data={posts}
        columns={[
          { key: 'title', header: 'Title', render: (item: CareerPost) => <span className="font-semibold text-slate-900 text-sm">{item.title}</span> },
          { key: 'slug', header: 'Slug', render: (item: CareerPost) => <span className="font-mono text-xs text-slate-500">{item.slug}</span> },
          { key: 'description', header: 'Description', render: (item: CareerPost) => <span className="text-slate-600 text-sm line-clamp-1">{item.description}</span> },
          { key: 'is_published', header: 'Status', render: (item: CareerPost) => (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${item.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
              {item.is_published ? 'Published' : 'Draft'}
            </span>
          )},
          { key: 'actions', header: 'Actions', className: 'text-right', render: (item: CareerPost) => (
            <div className="flex items-center justify-end gap-1">
              <button onClick={() => openEdit(item)} className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-red-50 transition-colors"><Eye className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          )},
        ]}
        currentPage={1}
        setCurrentPage={() => {}}
        totalPages={1}
        startIndex={0}
        endIndex={posts.length}
        totalItems={posts.length}
      />

      <Modal open={openModal} onClose={() => setOpenModal(false)} title={editing ? 'Edit Career Post' : 'New Career Post'} footer={
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
            <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Requirements (one per line)</label>
            <textarea value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_published" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
            <label htmlFor="is_published" className="text-sm text-slate-700">Published</label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
