import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { Layers } from 'lucide-react';

interface SuperSubCategory {
  id: number;
  name: string;
  slug: string;
  sub_category_id: number;
  sub_category?: { id: number; name: string; category?: { id: number; name: string } };
}

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

export function SuperSubCategoriesPage({ apiFetch }: { apiFetch: ApiFetch }) {
  const [items, setItems] = useState<SuperSubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<number | ''>('');
  const [parents, setParents] = useState<{ id: number; name: string }[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [ssRes, subsRes] = await Promise.all([
        apiFetch('/admin/super-sub-categories'),
        apiFetch('/admin/sub-categories'),
      ]);
      setItems(ssRes.super_sub_categories || ssRes || []);
      setParents((subsRes.sub_categories || subsRes || []).map((s: any) => ({ id: s.id, name: s.name })));
    } catch (e) {
      console.error(e);
      setItems([]);
      setParents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [apiFetch]);

  const startCreate = () => {
    setEditing(-1);
    setName('');
    setParentId(parents[0]?.id || '');
  };

  const startEdit = (item: SuperSubCategory) => {
    setEditing(item.id);
    setName(item.name);
    setParentId(item.sub_category_id);
  };

  const cancel = () => {
    setEditing(null);
    setName('');
    setParentId('');
  };

  const save = async () => {
    if (!name.trim() || parentId === '') return;
    setSaving(editing === -1 ? -999 : editing);
    try {
      if (editing === -1) {
        await apiFetch('/admin/super-sub-categories', {
          method: 'POST',
          body: JSON.stringify({ name, sub_category_id: Number(parentId) }),
        });
      } else if (editing && editing > 0) {
        await apiFetch(`/admin/super-sub-categories/${editing}`, {
          method: 'PUT',
          body: JSON.stringify({ name, sub_category_id: Number(parentId) }),
        });
      }
      await load();
      cancel();
    } catch (e) {
      console.error(e);
      alert('Failed to save super sub-category');
    } finally {
      setSaving(null);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this super sub-category?')) return;
    try {
      await apiFetch(`/admin/super-sub-categories/${id}`, { method: 'DELETE' });
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
        title="Super Sub Categories"
        subtitle="Manage deeper product types inside sub-categories."
        actionLabel="Add Super Sub Category"
        onAction={startCreate}
      />

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <DataTable
          data={items}
          columns={[
            { key: 'name', header: 'Name', render: (item: SuperSubCategory) => <span className="font-medium text-slate-900">{item.name}</span> },
            { key: 'slug', header: 'Slug', render: (item: SuperSubCategory) => <span className="font-mono text-xs text-slate-500">{item.slug}</span> },
            { key: 'parent', header: 'Parent Sub Category', render: (item: SuperSubCategory) => <span className="text-sm text-slate-600">{item.sub_category?.name || '-'}</span> },
            {
              key: 'actions',
              header: 'Actions',
              render: (item: SuperSubCategory) => (
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(item)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">Edit</button>
                  <button onClick={() => remove(item.id)} className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
                </div>
              ),
            },
          ]}
          title={`${items.length} Super Sub Categories`}
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
          <h3 className="text-sm font-semibold text-slate-900 mb-4">{editing === -1 ? 'Add Super Sub Category' : 'Edit Super Sub Category'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Parent Sub Category</label>
              <select value={parentId} onChange={(e) => setParentId(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary">
                <option value="">Select sub-category</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. RTX 40 Series" />
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
