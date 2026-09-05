import React, { useEffect, useState } from 'react';
import { Search, Plus, Eye, Trash2, X, Users } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';

interface JobPosting {
  id: number;
  title: string;
  slug: string;
  department: string;
  location: string;
  employment_type: string;
  description: string;
  responsibilities?: string;
  requirements?: string[];
  benefits?: string[];
  application_deadline?: string;
  is_active: boolean;
}

interface JobApplication {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  notice_period: string;
  cv_url: string;
  submitted_at: string;
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

export function JobPostingsPage({ apiFetch }: { apiFetch: ApiFetch }) {
  const [postings, setPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<JobPosting | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewingApplications, setViewingApplications] = useState<JobPosting | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '', department: '', location: '', employment_type: 'Full-time', description: '', responsibilities: '', requirements: '', benefits: '', application_deadline: '', is_active: true });

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/job-postings');
      setPostings(data.postings || []);
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

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', slug: '', department: '', location: '', employment_type: 'Full-time', description: '', responsibilities: '', requirements: '', benefits: '', application_deadline: '', is_active: true });
    setOpenModal(true);
  };

  const openEdit = (post: JobPosting) => {
    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug,
      department: post.department,
      location: post.location,
      employment_type: post.employment_type,
      description: post.description,
      responsibilities: post.responsibilities || '',
      requirements: Array.isArray(post.requirements) ? post.requirements.join('\n') : '',
      benefits: Array.isArray(post.benefits) ? post.benefits.join('\n') : '',
      application_deadline: post.application_deadline || '',
      is_active: post.is_active,
    });
    setOpenModal(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      payload.requirements = payload.requirements ? (payload.requirements as string).split('\n').filter(Boolean) : [];
      payload.benefits = payload.benefits ? (payload.benefits as string).split('\n').filter(Boolean) : [];
      if (!payload.application_deadline) delete payload.application_deadline;
      if (editing) {
        await apiFetch(`/admin/job-postings/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/admin/job-postings', { method: 'POST', body: JSON.stringify(payload) });
      }
      setOpenModal(false);
      await load();
    } catch (e) {
      console.error(e);
      alert('Failed to save job posting');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this job posting?')) return;
    try {
      await apiFetch(`/admin/job-postings/${id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const viewApplications = async (post: JobPosting) => {
    setViewingApplications(post);
    setLoadingApps(true);
    setApplications([]);
    try {
      const data = await apiFetch(`/admin/job-postings/${post.id}/applications`);
      setApplications(data.applications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingApps(false);
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
      <PageHeader title="Job Postings" subtitle="Manage open positions" actionLabel="Add Posting" onAction={openCreate} />

      <DataTable
        data={postings}
        columns={[
          { key: 'title', header: 'Title', render: (item: JobPosting) => <span className="font-semibold text-slate-900 text-sm">{item.title}</span> },
          { key: 'department', header: 'Department', render: (item: JobPosting) => <span className="text-slate-600 text-sm">{item.department}</span> },
          { key: 'location', header: 'Location', render: (item: JobPosting) => <span className="text-slate-600 text-sm">{item.location}</span> },
          { key: 'employment_type', header: 'Type', render: (item: JobPosting) => <span className="text-slate-600 text-sm">{item.employment_type}</span> },
          { key: 'application_deadline', header: 'Deadline', render: (item: JobPosting) => <span className="text-slate-600 text-sm">{item.application_deadline ? new Date(item.application_deadline).toLocaleDateString() : '-'}</span> },
          { key: 'is_active', header: 'Status', render: (item: JobPosting) => (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
              {item.is_active ? 'Active' : 'Closed'}
            </span>
          )},
          { key: 'actions', header: 'Actions', className: 'text-right', render: (item: JobPosting) => (
            <div className="flex items-center justify-end gap-1">
              <button onClick={() => viewApplications(item)} className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-red-50 transition-colors" title="View Applications"><Users className="w-4 h-4" /></button>
              <button onClick={() => openEdit(item)} className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-red-50 transition-colors"><Eye className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          )},
        ]}
        currentPage={1}
        setCurrentPage={() => {}}
        totalPages={1}
        startIndex={0}
        endIndex={postings.length}
        totalItems={postings.length}
      />

      <Modal open={openModal} onClose={() => setOpenModal(false)} title={editing ? 'Edit Job Posting' : 'New Job Posting'} footer={
        <>
          <button onClick={() => setOpenModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={submit} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </>
      }>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input type="text" value={form.title} onChange={e => handleTitleChange(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <input type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Employment Type</label>
            <select value={form.employment_type} onChange={e => setForm({ ...form, employment_type: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Responsibilities</label>
            <textarea value={form.responsibilities} onChange={e => setForm({ ...form, responsibilities: e.target.value })} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Requirements (one per line)</label>
            <textarea value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Benefits (one per line)</label>
            <textarea value={form.benefits} onChange={e => setForm({ ...form, benefits: e.target.value })} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Application Deadline</label>
            <input type="date" value={form.application_deadline} onChange={e => setForm({ ...form, application_deadline: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
            <label htmlFor="is_active" className="text-sm text-slate-700">Active</label>
          </div>
        </form>
      </Modal>

      <Modal open={!!viewingApplications} onClose={() => setViewingApplications(null)} title={`Applications - ${viewingApplications?.title || ''}`} footer={
        <button onClick={() => setViewingApplications(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Close</button>
      }>
        {loadingApps ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {applications.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No applications yet.</p>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900 text-sm">{app.full_name}</span>
                    <span className="text-xs text-slate-400">{new Date(app.submitted_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-600">{app.email}</p>
                  <p className="text-xs text-slate-600">{app.phone}</p>
                  {app.notice_period && <span className="inline-block mt-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{app.notice_period.replace('_', ' ')}</span>}
                  {app.cv_url && <a href={app.cv_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 ml-2 text-xs text-primary hover:underline">View CV</a>}
                </div>
              ))
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
