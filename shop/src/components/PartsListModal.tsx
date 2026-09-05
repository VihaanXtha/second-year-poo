import React from 'react';
import { CommunityBuild } from '../types';

interface PartsListModalProps {
  build: CommunityBuild | null;
  onClose: () => void;
  onAddAllPartsToCart: (build: CommunityBuild) => void;
}

export const PartsListModal: React.FC<PartsListModalProps> = ({ build, onClose, onAddAllPartsToCart }) => {
  if (!build) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#ffffff] rounded-lg border border-[#c6c6cd] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="bg-[#f0edef] border-b border-[#c6c6cd] px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#dc2626]">hardware</span>
              <h3 className="text-lg font-bold text-[#000000]">{build.title} — Parts Breakdown</h3>
            </div>
            <p className="text-xs font-mono text-[#45464d]">{build.subtitle} • Built by {build.builder}</p>
          </div>
          <button onClick={onClose} className="text-[#76777d] hover:text-[#000000]">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-xs text-[#45464d] mb-4 leading-relaxed">
            {build.description}
          </p>

          <div className="border border-[#c6c6cd] rounded overflow-hidden mb-6">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-[#f0edef] border-b border-[#c6c6cd] text-[#45464d]">
                  <th className="p-3">TYPE</th>
                  <th className="p-3">COMPONENT NAME</th>
                  <th className="p-3">VENDOR</th>
                  <th className="p-3 text-right">PRICE (NPR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c6c6cd]/50">
                {build.partsList.map((part, idx) => (
                  <tr key={idx} className="hover:bg-[#f6f3f5]">
                    <td className="p-3 font-bold text-[#dc2626]">{part.componentType}</td>
                    <td className="p-3">
                      <div className="font-bold text-[#000000]">{part.name}</div>
                      <div className="text-[10px] text-[#76777d]">SKU: {part.sku}</div>
                    </td>
                    <td className="p-3 text-[#45464d]">{part.vendorName}</td>
                    <td className="p-3 text-right font-bold text-[#000000]">
                      Rs. {part.priceNpr.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#0f172a] text-white font-bold">
                  <td colSpan={3} className="p-3">TOTAL VERIFIED BUILD ESTIMATE</td>
                  <td className="p-3 text-right font-mono text-sm text-[#38bdf8]">
                    Rs. {build.priceNpr.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#c6c6cd] text-xs font-mono font-bold rounded hover:bg-[#f6f3f5]"
            >
              Close
            </button>
            <button
              onClick={() => {
                onAddAllPartsToCart(build);
                onClose();
              }}
              className="px-5 py-2 bg-[#dc2626] text-white text-xs font-mono font-bold rounded hover:bg-[#b91c1c] flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
              Add Parts to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
