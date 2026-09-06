import React, { useEffect, useState, useRef } from 'react';
import { Search, Plus, Eye, Trash2, X, Upload, Pencil } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  cover_image?: string;
  body: string;
  published_at?: string;
  is_published: boolean;
  category?: string;
  author?: string;
}

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function BlogPostsPage({ apiFetch }: { apiFetch: ApiFetch }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ title: '', slug: '', cover_image: '', body: '', published_at: '', is_published: false, category: '', author: '' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/content/blog');
      setPosts(data.posts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [apiFetch]);

  const handleTitleChange = (value: string) => {
    const slug = toSlug(value);
    setForm({ ...form, title: value, slug });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const data = await apiFetch('/admin/content/upload/image', {
        method: 'POST',
        body: fd,
      });
      const url = data.url as string;
      setForm({ ...form, cover_image: url });
      setPreviewUrl(url);
    } catch (e) {
      console.error(e);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', slug: '', cover_image: '', body: '', published_at: '', is_published: false, category: '', author: '' });
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setOpenModal(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditing(post);
      setForm({
        title: post.title,
        slug: post.slug,
        cover_image: post.cover_image || '',
        body: post.body || '',
        published_at: post.published_at ? post.published_at.slice(0, 10) : '',
        is_published: post.is_published,
        category: post.category || '',
        author: post.author || '',
      });
    setPreviewUrl(post.cover_image || '');
    setOpenModal(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      if (!payload.published_at) delete payload.published_at;
      if (editing) {
        await apiFetch(`/admin/content/blog/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/admin/content/blog', { method: 'POST', body: JSON.stringify(payload) });
      }
      setOpenModal(false);
      await load();
    } catch (e) {
      console.error(e);
      alert('Failed to save blog post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this blog post?')) return;
    try {
      await apiFetch(`/admin/content/blog/${id}`, { method: 'DELETE' });
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
      <PageHeader title="Blog Posts" subtitle="Manage blog articles" actionLabel="Add Post" onAction={openCreate} />

      <DataTable
        data={posts}
        columns={[
          { key: 'title', header: 'Title', render: (item: BlogPost) => <span className="font-semibold text-slate-900 text-sm">{item.title}</span> },
          { key: 'category', header: 'Category', render: (item: BlogPost) => <span className="text-slate-600 text-sm">{item.category || '-'}</span> },
          { key: 'author', header: 'Author', render: (item: BlogPost) => <span className="text-slate-600 text-sm">{item.author || '-'}</span> },
          { key: 'published_at', header: 'Published', render: (item: BlogPost) => <span className="text-slate-600 text-sm">{item.published_at ? new Date(item.published_at).toLocaleDateString() : '-'}</span> },
          { key: 'is_published', header: 'Status', render: (item: BlogPost) => (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${item.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
              {item.is_published ? 'Published' : 'Draft'}
            </span>
          )},
          { key: 'actions', header: 'Actions', className: 'text-right', render: (item: BlogPost) => (
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
        endIndex={posts.length}
        totalItems={posts.length}
      />

      <Modal open={openModal} onClose={() => setOpenModal(false)} title={editing ? 'Edit Blog Post' : 'New Blog Post'} footer={
        <>
          <button onClick={() => setOpenModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={submit} disabled={saving || uploading} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </>
      }>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input type="text" value={form.title} onChange={e => handleTitleChange(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Author</label>
              <input type="text" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cover Image</label>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            {previewUrl && (
              <div className="mt-2">
                <img src={previewUrl} alt="Preview" className="h-32 w-full object-cover rounded-lg" />
                <button type="button" onClick={() => { setForm({ ...form, cover_image: '' }); setPreviewUrl(''); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="mt-1 text-xs text-red-600 hover:underline">Remove image</button>
              </div>
            )}
            {uploading && <p className="text-xs text-slate-500 mt-1">Uploading...</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Body</label>
            <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={8} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Publish Date</label>
            <input type="date" value={form.published_at} onChange={e => setForm({ ...form, published_at: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
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
