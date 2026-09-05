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
import type { Product } from '../types';

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
  image_url: string;
  status: 'active' | 'draft';
}

const blankForm: ProductForm = {
  name: '',
  sku: '',
  description: '',
  category: '',
  price: '',
  stock: '',
  image_url: '',
  status: 'active',
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

  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return Array.from(set).sort();
  }, [products]);

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
    setForm({
      name: product.name || '',
      sku: product.sku || '',
      description: product.description || '',
      category: product.category || '',
      price: String(product.price ?? 0),
      stock: String(product.stock ?? 0),
      image_url: product.image_url || '',
      status: (product.status as any) === 'draft' ? 'draft' : 'active',
    });
    setOpenForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        sku: form.sku || undefined,
        description: form.description || undefined,
        category: form.category,
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
        image_url: form.image_url || undefined,
        status: form.status,
      };
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
            options={[{ value: 'all', label: 'All categories' }, ...categories.map((c) => ({ value: c, label: c }))]}
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
                          {p.image_url ? (
                            <img
                              src={p.image_url}
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
          <TextField
            label="Category"
            required
            value={form.category}
            onChange={(v) => setForm({ ...form, category: v })}
            placeholder="e.g. Resistors"
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
          <TextField
            label="Image URL"
            value={form.image_url}
            onChange={(v) => setForm({ ...form, image_url: v })}
            placeholder="https://..."
          />
          <SelectField
            label="Status"
            value={form.status}
            onChange={(v) => setForm({ ...form, status: v as 'active' | 'draft' })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'draft', label: 'Draft' },
            ]}
          />
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