import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';

interface Category {
  id: number;
  name: string;
  slug: string;
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

export function CategoriesPage({ apiFetch }: { apiFetch: ApiFetch }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [jsonText, setJsonText] = useState('');

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

  const startEdit = (category: Category) => {
    setEditing(category.id);
    setJsonText(JSON.stringify(category.spec_schema || [], null, 2));
  };

  const cancelEdit = () => {
    setEditing(null);
    setJsonText('');
  };

  const save = async (id: number) => {
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
      cancelEdit();
    } catch (e) {
      console.error(e);
      alert('Failed to save category');
    } finally {
      setSaving(null);
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
        description="Manage product categories and their specification schemas."
      />

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <DataTable
          data={categories}
          columns={[
            { key: 'name', header: 'Name', render: (item: Category) => <span className="font-medium text-slate-900">{item.name}</span> },
            { key: 'slug', header: 'Slug', render: (item: Category) => <span className="font-mono text-xs text-slate-500">{item.slug}</span> },
            { key: 'spec_schema', header: 'Spec Schema', render: (item: Category) => (
              <span className="text-xs text-slate-500">
                {(item.spec_schema?.length || 0)} fields defined
              </span>
            )},
            {
              key: 'actions',
              header: 'Actions',
              render: (item: Category) => (
                <div className="flex items-center gap-2">
                  {editing === item.id ? (
                    <>
                      <button
                        onClick={() => save(item.id)}
                        disabled={saving === item.id}
                        className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-50"
                      >
                        {saving === item.id ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEdit(item)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Edit Schema
                    </button>
                  )}
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

      {editing && (
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
        </div>
      )}
    </div>
  );
}
