import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { ListingItem } from '../types';

interface ListingData {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: string;
}

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

export const Inventory: React.FC<{ apiFetch: ApiFetch }> = ({ apiFetch }) => {
  const [listings, setListings] = useState<ListingData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 8;

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        const data = await apiFetch(`/vendor/products?${params.toString()}`);
        setListings((data.data || []).map((p: any) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category?.name || '-',
          price: p.price,
          stock: p.stock,
          status: p.status,
        })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiFetch, searchQuery]);

  const filteredListings = useMemo(() => {
    if (!searchQuery.trim()) return listings;
    const q = searchQuery.toLowerCase();
    return listings.filter(
      (listing) =>
        listing.name.toLowerCase().includes(q) ||
        listing.sku.toLowerCase().includes(q) ||
        listing.category.toLowerCase().includes(q)
    );
  }, [listings, searchQuery]);

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentListings = filteredListings.slice(startIndex, endIndex);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await apiFetch(`/vendor/products/${id}`, { method: 'DELETE' });
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="text-slate-400">Loading inventory...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Inventory</h2>
        <button className="px-4 py-2 bg-[#dc2626] text-white rounded-xl text-sm font-mono font-bold hover:bg-[#b91c1c] transition-colors flex items-center gap-2 cursor-pointer">
          <Plus className="w-4 h-4" />
          Add New Listing
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by name, SKU, or category..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="w-full bg-[#1e293b] border border-[#33415b] rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#dc2626]"
        />
      </div>

      <div className="border border-[#1e293b] rounded-2xl overflow-hidden bg-[#0f172a]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#1e293b]/30">
                <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">SKU</th>
                <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Product</th>
                <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Category</th>
                <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Price</th>
                <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Stock</th>
                <th className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-5 py-3 text-right text-xs font-mono uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentListings.map((listing) => (
                <tr key={listing.id} className="border-b border-[#1e293b]/50 hover:bg-[#1e293b]/30 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-slate-400">{listing.sku}</td>
                  <td className="px-5 py-3 font-medium text-white">{listing.name}</td>
                  <td className="px-5 py-3 text-slate-400">{listing.category}</td>
                  <td className="px-5 py-3 font-mono text-[#dc2626] font-bold">Rs. {Number(listing.price).toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <span className={`font-mono text-xs ${
                      listing.stock > 10 ? 'text-green-400' : listing.stock > 0 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {listing.stock} left
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-mono capitalize ${
                      listing.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors cursor-pointer">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(listing.id)} className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors cursor-pointer">
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
            Showing {startIndex + 1}-{Math.min(endIndex, filteredListings.length)} of {filteredListings.length} listings
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-[#1e293b] text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:text-slate-300"
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
                    : 'border-[#1e293b] text-slate-500 hover:text-slate-300'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded border border-[#1e293b] text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:text-slate-300"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
