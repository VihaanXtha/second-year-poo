import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { Plus, Trash2 } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  display_order?: number;
  is_active: boolean;
  spec_schema?: Array<{
    key: string;
    label: string;
    type: string;
    unit?: string;
    options?: string[];
  }>;
}

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export function CategoriesPage({ apiFetch }: { apiFetch: ApiFetch }) {
    const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', display_order: 0, is_active: true });
  const [jsonText, setJsonText] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'schema'>('list');

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/categories');
      setCategories(data.categories || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [apiFetch]);

    const startCreate = () => {
    setEditing(-1);
    setForm({ name: '', slug: '', description: '', display_order: 0, is_active: true });
    setActiveTab('list');
  };

  const startEdit = (category: Category) => {
    setEditing(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      display_order: category.display_order || 0,
      is_active: category.is_active,
    });
    setActiveTab('list');
  };

  const startEditSchema = (category: Category) => {
    setEditing(category.id);
    setJsonText(JSON.stringify(category.spec_schema || [], null, 2));
    setActiveTab('schema');
  };

  const cancel = () => {
    setEditing(null);
    setForm({ name: '', slug: '', description: '', display_order: 0, is_active: true });
    setJsonText('');
  };

  const saveCategory = async () => {
    if (!form.name.trim()) return;
    setSaving(editing === -1 ? -999 : editing);
    try {
      const payload = {
        ...form,
        slug: form.slug || generateSlug(form.name),
        display_order: Number(form.display_order),
      };
      if (editing === -1) {
        await apiFetch('/admin/categories', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } else if (editing && editing > 0) {
        await apiFetch(`/admin/categories/${editing}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      }
      await load();
      cancel();
    } catch (e) {
      console.error(e);
      alert('Failed to save category');
    } finally {
      setSaving(null);
    }
  };

  const saveSchema = async (id: number) => {
    setSaving(id);
    try {
      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        alert('Invalid JSON');
        setSaving(null);
        return;
      }

      await apiFetch(`/admin/categories/${id}/spec-schema`, {
        method: 'PUT',
        body: JSON.stringify({ spec_schema: parsed }),
      });

      await load();
      cancel();
    } catch (e) {
      console.error(e);
      alert('Failed to save category');
    } finally {
      setSaving(null);
    }
  };

  const toggleStatus = async (item: Category) => {
    try {
      await apiFetch(`/admin/categories/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...item, is_active: !item.is_active }),
      });
      setCategories(categories.map(i => i.id === item.id ? { ...i, is_active: !i.is_active } : i));
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this category? This action cannot be undone.')) return;
    try {
      await apiFetch(`/admin/categories/${id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      console.error(e);
      alert('Failed to delete');
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
        title="Categories"
        subtitle="Manage product categories and their specification schemas."
        actionLabel="Add Category"
        onAction={startCreate}
      />

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <DataTable
          data={categories}
                    columns={[
            { key: 'name', header: 'Name', render: (item: Category) => <span className="font-medium text-slate-900">{item.name}</span> },
            { key: 'slug', header: 'Slug', render: (item: Category) => <span className="font-mono text-xs text-slate-500">{item.slug}</span> },
            {
              key: 'is_active',
              header: 'Status',
              render: (item: Category) => (
                <button
                  onClick={() => toggleStatus(item)}
                  className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${
                    item.is_active ? 'bg-green-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      item.is_active ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (item: Category) => (
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(item)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">Edit</button>
                  <button onClick={() => startEditSchema(item)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">Edit Schema</button>
                  <button onClick={() => remove(item.id)} className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
                </div>
              ),
            },
          ]}
          title={`${categories.length} Categories`}
          searchable={false}
          currentPage={1}
          setCurrentPage={() => {}}
          totalPages={1}
          startIndex={0}
          endIndex={categories.length}
          totalItems={categories.length}
        />
      </div>

            {editing !== null && activeTab === 'list' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">{editing === -1 ? 'Add Category' : 'Edit Category'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. Graphics Cards" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. graphics-cards" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" rows={3} placeholder="Optional category description" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Display Order</label>
              <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" min="0" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
              <select value={form.is_active ? 'active' : 'inactive'} onChange={(e) => setForm({ ...form, is_active: e.target.value === 'active' })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button onClick={saveCategory} disabled={saving === (editing === -1 ? -999 : editing)} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-50">{saving === (editing === -1 ? -999 : editing) ? 'Saving...' : 'Save'}</button>
            <button onClick={() => startEditSchema(categories.find(c => c.id === editing)!)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Edit Spec Schema</button>
            <button onClick={cancel} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      )}

      {editing !== null && activeTab === 'schema' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Edit Spec Schema: {categories.find((c) => c.id === editing)?.name}
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Define specification fields as JSON array. Example:
            <code className="ml-2 px-2 py-1 bg-slate-100 rounded text-[10px]">
              [{"{"}"key":"socket_type","label":"Socket Type","type":"select","options":["AM5","LGA1700"]{"}"}]
            </code>
          </p>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full h-64 font-mono text-xs p-4 rounded-lg border border-slate-200 focus:outline-none focus:border-primary"
            spellCheck={false}
          />
          <div className="mt-4 flex items-center gap-2">
            <button onClick={() => saveSchema(editing!)} disabled={saving === editing} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-50">{saving === editing ? 'Saving...' : 'Save Schema'}</button>
            <button onClick={() => setActiveTab('list')} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Back to Edit</button>
            <button onClick={cancel} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
