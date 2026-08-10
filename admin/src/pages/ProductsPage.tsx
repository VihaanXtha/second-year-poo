import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';

interface ProductData {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: string;
  vendor_store: { store_name: string };
  category: { name: string };
  created_at: string;
}

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

export const ProductsPage: React.FC<{ apiFetch: ApiFetch }> = ({ apiFetch }) => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
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
    return <div className="text-slate-400">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Products</h2>
        <button className="px-4 py-2 bg-[#dc2626] text-white rounded-xl text-sm font-mono font-bold hover:bg-[#b91c1c] transition-colors flex items-center gap-2 cursor-pointer">
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#dc2626]"
        />
      </div>

      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/30">
                <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Product</th>
                <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">SKU</th>
                <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Vendor</th>
                <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Price</th>
                <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Stock</th>
                <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-5 py-3 text-right text-xs font-mono uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product) => (
                <tr key={product.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-white">{product.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-400">{product.sku}</td>
                  <td className="px-5 py-3 text-slate-400">{product.vendor_store?.store_name || '-'}</td>
                  <td className="px-5 py-3 font-mono text-[#dc2626] font-bold">Rs. {Number(product.price).toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <span className={`font-mono text-xs ${
                      product.stock > 10 ? 'text-green-400' : product.stock > 0 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-mono capitalize ${
                      product.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors cursor-pointer">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors cursor-pointer">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs font-mono text-slate-500">
          <span>
            Showing {startIndex + 1}-{Math.min(endIndex, products.length)} of {products.length} products
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-slate-800 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:text-slate-300"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-2.5 py-1 rounded border ${
                  currentPage === page
                    ? 'bg-[#dc2626]/15 border-[#dc2626] text-[#dc2626] font-bold'
                    : 'border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded border border-slate-800 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:text-slate-300"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
