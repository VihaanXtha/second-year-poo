import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Trash2, X } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Product } from '../types';

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

export const ProductsPage: React.FC<{ apiFetch: ApiFetch }> = ({ apiFetch }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const itemsPerPage = 8;

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        const data = await apiFetch(`/admin/products?${params.toString()}`);
        setProducts(data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiFetch, searchQuery]);

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(p => p.id !== id));
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
      <PageHeader title="Products" subtitle="Manage product inventory" actionLabel="Add Product" onAction={() => {}} />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
        />
      </div>

      <DataTable
        data={currentProducts}
        columns={[
          { key: 'name', header: 'Product', render: (item: Product) => (
            <span className="font-semibold text-slate-900 text-sm">{item.name}</span>
          )},
          { key: 'sku', header: 'SKU', render: (item: Product) => (
            <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{item.sku}</span>
          )},
          { key: 'vendor', header: 'Vendor', render: (item: Product) => (
            <span className="text-slate-600 text-sm">{item.vendor_store?.store_name || '-'}</span>
          )},
          { key: 'category', header: 'Category', render: (item: Product) => (
            <span className="text-slate-600 text-sm">{item.category?.name || '-'}</span>
          )},
          { key: 'price', header: 'Price', render: (item: Product) => (
            <span className="font-mono text-sm text-primary font-bold">Rs. {Number(item.price).toLocaleString()}</span>
          )},
          { key: 'stock', header: 'Stock', render: (item: Product) => (
            <span className={`font-mono text-sm font-semibold ${
              item.stock > 10 ? 'text-green-600' : item.stock > 0 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {item.stock}
            </span>
          )},
          { key: 'status', header: 'Status', render: (item: Product) => (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
              item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {item.status}
            </span>
          )},
          { key: 'actions', header: 'Actions', className: 'text-right', render: (item: Product) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => setSelectedProduct(item)}
                className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-red-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )},
        ]}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={products.length}
      />

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Product Details</h3>
              <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-lg font-bold text-slate-900">{selectedProduct.name}</p>
              <p className="text-sm text-slate-500">SKU: {selectedProduct.sku}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Price</p>
                  <p className="font-bold text-primary">Rs. {Number(selectedProduct.price).toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Stock</p>
                  <p className="font-bold text-slate-900">{selectedProduct.stock} units</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Vendor</p>
                  <p className="font-semibold text-slate-700">{selectedProduct.vendor_store?.store_name || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Category</p>
                  <p className="font-semibold text-slate-700">{selectedProduct.category?.name || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
