import React, { useEffect, useMemo, useState } from 'react';
import type { ApiFetch } from '../App';
import {
  Card,
  EmptyState,
  ErrorBanner,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SelectField,
  Spinner,
  TextField,
  formatCurrency,
} from '../components/UI';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import type { Product, Category, CategorySpecField } from '../types';

interface ProductsProps {
  apiFetch: ApiFetch;
}

interface ProductForm {
  name: string;
  sku: string;
  description: string;
  category: string;
  price: string;
  stock: string;
  image: string;
  imagePreview: string | null;
  status: 'active' | 'draft';
  specs: Record<string, unknown>;
}

const blankForm: ProductForm = {
  name: '',
  sku: '',
  description: '',
  category: '',
  price: '',
  stock: '',
  image: '',
  imagePreview: null,
  status: 'active',
  specs: {},
};

export function Products({ apiFetch }: ProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(blankForm);
  const [saving, setSaving] = useState(false);

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<any>('/vendor/products');
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setProducts(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const data = await apiFetch<{ categories: Category[] }>('/api/categories');
      setAllCategories(data.categories ?? []);
    } catch (e) {
      setCategoriesError(e instanceof Error ? e.message : 'Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadCategories();
  }, []);

  const activeSpecSchema = useMemo(() => {
    if (!form.category) return [];
    const cat = allCategories.find((c) => c.name === form.category || String(c.id) === form.category);
    return cat?.spec_schema ?? [];
  }, [form.category, allCategories]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = search
        ? (p.name + ' ' + (p.sku || '') + ' ' + p.category).toLowerCase().includes(search.toLowerCase())
        : true;
      const matchCat = category === 'all' ? true : p.category === category;
      const matchStatus = status === 'all' ? true : (p.status || 'active') === status;
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, search, category, status]);

  const openCreate = () => {
    setEditing(null);
    setForm(blankForm);
    setOpenForm(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    const specs = (product.specs as Record<string, unknown>) || {};
    setForm({
      name: product.name || '',
      sku: product.sku || '',
      description: product.description || '',
      category: product.category || '',
      price: String(product.price ?? 0),
      stock: String(product.stock ?? 0),
      image: product.image || '',
      imagePreview: product.image || null,
      status: (product.status as any) === 'draft' ? 'draft' : 'active',
      specs,
    });
    setOpenForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.imagePreview) {
        const fd = new FormData();
        fd.append('name', form.name);
        if (form.sku) fd.append('sku', form.sku);
        if (form.description) fd.append('description', form.description);
        fd.append('category', form.category);
        fd.append('price', String(Number(form.price) || 0));
        fd.append('stock', String(Number(form.stock) || 0));
        fd.append('status', form.status);
        if (Object.keys(form.specs).length > 0) {
          fd.append('specs', JSON.stringify(form.specs));
        }
        fd.append('image', form.imagePreview);
        if (editing) {
          await apiFetch(`/vendor/products/${editing.id}`, {
            method: 'PUT',
            body: fd,
          });
        } else {
          await apiFetch('/vendor/products', {
            method: 'POST',
            body: fd,
          });
        }
      } else {
        const payload: Record<string, unknown> = {
          name: form.name,
          sku: form.sku || undefined,
          description: form.description || undefined,
          category: form.category,
          price: Number(form.price) || 0,
          stock: Number(form.stock) || 0,
          status: form.status,
        };
        if (Object.keys(form.specs).length > 0) {
          payload.specs = form.specs;
        }
        if (form.image) {
          payload.image = form.image;
        }
        if (editing) {
          await apiFetch(`/vendor/products/${editing.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
        } else {
          await apiFetch('/vendor/products', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
        }
      }
      setOpenForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await apiFetch(`/vendor/products/${product.id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete product');
    }
  };

  const handleCategoryChange = (value: string) => {
    const schema = allCategories.find((c) => c.name === value || String(c.id) === value)?.spec_schema ?? [];
    const allowedKeys = new Set(schema.map((s) => s.key));
    const nextSpecs: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(form.specs)) {
      if (allowedKeys.has(key)) {
        nextSpecs[key] = val;
      }
    }
    setForm((f) => ({ ...f, category: value, specs: nextSpecs }));
  };

  const updateSpec = (key: string, value: unknown) => {
    setForm((f) => ({ ...f, specs: { ...f.specs, [key]: value } }));
  };

  return (
    <div>
      <PageHeader
        title="Product Management"
        description="Create, update and organise the products in your store."
        action={
          <PrimaryButton onClick={openCreate} icon="add">
            Add product
          </PrimaryButton>
        }
      />

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      <Card className="mb-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <TextField
              label="Search"
              value={search}
              onChange={setSearch}
              placeholder="Search by name, SKU, or category"
            />
          </div>
          <SelectField
            label="Category"
            value={category}
            onChange={setCategory}
            options={[
              { value: 'all', label: 'All categories' },
              ...allCategories.map((c) => ({ value: c.name, label: c.name })),
            ]}
          />
          <SelectField
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'active', label: 'Active' },
              { value: 'draft', label: 'Draft' },
              { value: 'out_of_stock', label: 'Out of stock' },
            ]}
          />
        </div>
      </Card>

      <Card title={`Products (${filtered.length})`} subtitle="Manage your inventory">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="inventory_2"
            title="No products found"
            description={
              products.length === 0
                ? 'Add your first product to start selling.'
                : 'Try adjusting your search or filters.'
            }
            action={
              products.length === 0 ? (
                <PrimaryButton onClick={openCreate} icon="add">
                  Add product
                </PrimaryButton>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-slate-400">
                  <th className="pb-3 font-semibold">Product</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Price</th>
                  <th className="pb-3 font-semibold">Stock</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="text-slate-700">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-500">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="h-full w-full object-cover"
                              onError={(e) => ((e.currentTarget.style.display = 'none'))}
                            />
                          ) : (
                            <span className="material-symbols-outlined">image</span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{p.name}</div>
                          {p.sku && <div className="text-xs text-slate-400">SKU: {p.sku}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-slate-500">{p.category || '—'}</td>
                    <td className="py-3 font-semibold text-slate-900">
                      {formatCurrency(p.price)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`font-semibold ${
                          p.stock === 0
                            ? 'text-rose-600'
                            : p.stock < 5
                            ? 'text-amber-600'
                            : 'text-slate-900'
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-3">
                      <StatusBadge status={(p.stock === 0 ? 'out_of_stock' : p.status) || 'active'} />
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => remove(p)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={openForm}
        onClose={() => setOpenForm(false)}
        title={editing ? 'Edit product' : 'Add new product'}
        description={
          editing
            ? 'Update the product details below.'
            : 'Fill in the product information to publish a new listing.'
        }
        size="lg"
      >
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={submit}>
          <div className="md:col-span-2">
            <TextField
              label="Product name"
              required
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />
          </div>
          <TextField
            label="SKU"
            value={form.sku}
            onChange={(v) => setForm({ ...form, sku: v })}
            placeholder="e.g. ELE-001"
          />
          <SelectField
            label="Category"
            required
            value={form.category}
            onChange={handleCategoryChange}
            options={
              categoriesLoading
                ? [{ value: '', label: 'Loading...' }]
                : [
                    { value: '', label: 'Select a category' },
                    ...allCategories.map((c) => ({ value: c.name, label: c.name })),
                  ]
            }
          />
          <TextField
            label="Price"
            required
            type="number"
            prefix="$"
            value={form.price}
            onChange={(v) => setForm({ ...form, price: v })}
          />
          <TextField
            label="Stock"
            required
            type="number"
            value={form.stock}
            onChange={(v) => setForm({ ...form, stock: v })}
          />
          <div className="md:col-span-2">
            <TextField
              label="Description"
              rows={3}
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Product Image</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    setForm((f) => ({
                      ...f,
                      imagePreview: reader.result as string,
                      image: '',
                    }));
                  };
                  reader.readAsDataURL(file);
                } else {
                  setForm((f) => ({ ...f, imagePreview: null, image: f.image }));
                }
              }}
            />
            {(form.imagePreview || form.image) && (
              <div className="mt-2 flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <img
                  src={form.imagePreview || form.image}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            {form.image && !form.imagePreview && (
              <p className="mt-1 text-xs text-slate-500">Using existing image URL. Upload a new file to replace it.</p>
            )}
          </div>
          <SelectField
            label="Status"
            value={form.status}
            onChange={(v) => setForm({ ...form, status: v as 'active' | 'draft' })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'draft', label: 'Draft' },
            ]}
          />
          {activeSpecSchema.length > 0 && (
            <>
              <div className="md:col-span-2 mt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Specifications</p>
              </div>
              {activeSpecSchema.map((field) => (
                <SpecField
                  key={field.key}
                  field={field}
                  value={form.specs[field.key]}
                  onChange={(value) => updateSpec(field.key, value)}
                />
              ))}
            </>
          )}
          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <SecondaryButton onClick={() => setOpenForm(false)}>Cancel</SecondaryButton>
            <PrimaryButton type="submit" disabled={saving} icon="save">
              {saving ? 'Saving...' : editing ? 'Update product' : 'Create product'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}

interface SpecFieldProps {
  field: CategorySpecField;
  value: unknown;
  onChange: (value: unknown) => void;
}

function SpecField({ field, value, onChange }: SpecFieldProps) {
  const label = field.unit ? `${field.label} (${field.unit})` : field.label;

  if (field.type === 'select') {
    return (
      <SelectField
        label={label}
        value={String(value ?? '')}
        onChange={(v) => onChange(v || null)}
        options={[
          { value: '', label: 'None' },
          ...(field.options ?? []).map((opt) => ({ value: opt, label: opt })),
        ]}
      />
    );
  }

  if (field.type === 'boolean') {
    return (
      <div className="flex items-center gap-2 pt-6">
        <input
          id={field.key}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
        />
        <label htmlFor={field.key} className="text-sm text-slate-700">
          {field.label}
        </label>
      </div>
    );
  }

  if (field.type === 'number') {
    return (
      <TextField
        label={label}
        type="number"
        value={String(value ?? '')}
        onChange={(v) => {
          const num = Number(v);
          onChange(v === '' ? '' : Number.isNaN(num) ? v : num);
        }}
      />
    );
  }

  return (
    <TextField
      label={label}
      value={String(value ?? '')}
      onChange={(v) => onChange(v || null)}
    />
  );
}
