import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { HelpCircle } from 'lucide-react';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

export function FaqPage({ apiFetch }: { apiFetch: ApiFetch }) {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ question: '', answer: '', category: 'General' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/faqs');
      setItems(data.faqs || data || []);
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
    setForm({ question: '', answer: '', category: 'General' });
  };

  const startEdit = (item: FaqItem) => {
    setEditing(item.id);
    setForm({ question: item.question, answer: item.answer, category: item.category });
  };

  const cancel = () => {
    setEditing(null);
    setForm({ question: '', answer: '', category: 'General' });
  };

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(editing === -1 ? -999 : editing);
    try {
      if (editing === -1) {
        await apiFetch('/admin/faqs', { method: 'POST', body: JSON.stringify(form) });
      } else if (editing && editing > 0) {
        await apiFetch(`/admin/faqs/${editing}`, { method: 'PUT', body: JSON.stringify(form) });
      }
      await load();
      cancel();
    } catch (e) {
      console.error(e);
      alert('Failed to save FAQ');
    } finally {
      setSaving(null);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this FAQ?')) return;
    try {
      await apiFetch(`/admin/faqs/${id}`, { method: 'DELETE' });
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
        title="FAQ"
        subtitle="Manage frequently asked questions."
        actionLabel="Add FAQ"
        onAction={startCreate}
      />

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <DataTable
          data={items}
          columns={[
            { key: 'question', header: 'Question', render: (item: FaqItem) => <span className="font-medium text-slate-900">{item.question}</span> },
            { key: 'answer', header: 'Answer', render: (item: FaqItem) => <span className="text-sm text-slate-600 line-clamp-2">{item.answer}</span> },
            { key: 'category', header: 'Category', render: (item: FaqItem) => <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{item.category}</span> },
            {
              key: 'actions',
              header: 'Actions',
              render: (item: FaqItem) => (
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(item)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">Edit</button>
                  <button onClick={() => remove(item.id)} className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
                </div>
              ),
            },
          ]}
          title={`${items.length} FAQs`}
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
          <h3 className="text-sm font-semibold text-slate-900 mb-4">{editing === -1 ? 'Add FAQ' : 'Edit FAQ'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Question</label>
              <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="Enter question" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Answer</label>
              <textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="Enter answer" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. Shipping, Payments" />
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
