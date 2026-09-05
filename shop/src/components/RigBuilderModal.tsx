"use client";

import React, { useState } from 'react';
import { PRODUCTS } from '../data/hardwareData';
import { Product } from '../types';

interface RigBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBuildToCart: (products: Product[]) => void;
}

type SlotKey = 'cpu' | 'motherboard' | 'gpu' | 'ram' | 'storage' | 'psu' | 'case';

interface RigSlot {
  key: SlotKey;
  label: string;
  icon: string;
  wattageEst: number;
}

const RIG_SLOTS: RigSlot[] = [
  { key: 'cpu', label: 'Processor (CPU)', icon: 'memory', wattageEst: 105 },
  { key: 'motherboard', label: 'Motherboard', icon: 'developer_board', wattageEst: 50 },
  { key: 'gpu', label: 'Graphics Card (GPU)', icon: 'videogame_asset', wattageEst: 280 },
  { key: 'ram', label: 'Memory (RAM)', icon: 'view_column', wattageEst: 15 },
  { key: 'storage', label: 'SSD Storage', icon: 'hard_drive', wattageEst: 10 },
  { key: 'psu', label: 'Power Supply (PSU)', icon: 'power', wattageEst: 0 },
  { key: 'case', label: 'Chassis / Case', icon: 'desktop_windows', wattageEst: 10 },
];

export const RigBuilderModal: React.FC<RigBuilderModalProps> = ({
  isOpen,
  onClose,
  onAddBuildToCart,
}) => {
  const [selectedParts, setSelectedParts] = useState<Partial<Record<SlotKey, Product>>>({});
  const [activeSlot, setActiveSlot] = useState<SlotKey | null>('cpu');

  if (!isOpen) return null;

  const handleSelectPart = (slotKey: SlotKey, product: Product) => {
    setSelectedParts((prev) => ({ ...prev, [slotKey]: product }));
  };

  const handleRemovePart = (slotKey: SlotKey) => {
    setSelectedParts((prev) => {
      const copy = { ...prev };
      delete copy[slotKey];
      return copy;
    });
  };

  const selectedProductsList = Object.values(selectedParts).filter(Boolean) as Product[];
  const totalPrice = selectedProductsList.reduce((acc, p) => acc + p.priceNpr, 0);
  const totalEstimatedWattage = selectedProductsList.reduce((acc, p) => {
    const slot = RIG_SLOTS.find((s) => selectedParts[s.key]?.id === p.id);
    return acc + (slot ? slot.wattageEst : 30);
  }, 0);

  const handleConfirmBuild = () => {
    if (selectedProductsList.length > 0) {
      onAddBuildToCart(selectedProductsList);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in-down overflow-y-auto">
      <div className="bg-[#ffffff] border border-[#c6c6cd] rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="bg-[#0f172a] text-white p-4 sm:p-6 flex justify-between items-center border-b border-[#1e293b] relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#dc2626] flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-[#ffffff] text-[24px]">construction</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Custom PC Rig Builder</h2>
                <span className="bg-[#dc2626]/20 text-[#dc2626] text-[10px] font-mono px-2 py-0.5 rounded font-bold border border-[#dc2626]/40">
                  LIVE COMPATIBILITY
                </span>
              </div>
              <p className="text-xs text-gray-300 font-mono mt-0.5">
                Configure your ultimate workstation or gaming rig with verified Nepal vendor stock
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:rotate-90 transition-all duration-200 p-1.5 rounded-lg hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left Column: Component Slots */}
          <div className="md:col-span-5 p-4 bg-[#fcf8fa] border-r border-[#c6c6cd] overflow-y-auto space-y-3">
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-xs font-bold text-[#45464d] uppercase">Component Checklist</span>
              <span className="font-mono text-xs text-[#dc2626] font-bold">
                {Object.keys(selectedParts).length} / {RIG_SLOTS.length} Selected
              </span>
            </div>

            {RIG_SLOTS.map((slot) => {
              const selected = selectedParts[slot.key];
              const isActive = activeSlot === slot.key;

              return (
                <div
                  key={slot.key}
                  onClick={() => setActiveSlot(slot.key)}
                  className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white border-[#000000] shadow-md ring-2 ring-[#000000]/10'
                      : selected
                      ? 'bg-white border-[#10b981]/50 hover:border-[#10b981]'
                      : 'bg-white/60 border-[#c6c6cd] hover:border-[#76777d]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`material-symbols-outlined text-[20px] ${selected ? 'text-[#10b981]' : 'text-[#45464d]'}`}>
                        {slot.icon}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[#000000]">{slot.label}</p>
                        <p className="text-[11px] font-mono text-[#45464d] truncate max-w-[180px]">
                          {selected ? selected.name : 'Not selected yet'}
                        </p>
                      </div>
                    </div>

                    {selected ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#000000]">
                          Rs. {selected.priceNpr.toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePart(slot.key);
                          }}
                          className="text-[#dc2626] hover:bg-[#dc2626]/10 p-1 rounded transition-colors"
                          title="Remove part"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-[#dc2626] bg-[#dc2626]/10 px-2 py-0.5 rounded">
                        SELECT
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Component Picker */}
          <div className="md:col-span-7 p-4 sm:p-5 overflow-y-auto flex flex-col bg-[#ffffff]">
            {activeSlot ? (
              <>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#c6c6cd]">
                  <h3 className="font-bold text-sm text-[#000000] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#dc2626]">
                      {RIG_SLOTS.find((s) => s.key === activeSlot)?.icon}
                    </span>
                    Choose {RIG_SLOTS.find((s) => s.key === activeSlot)?.label}
                  </h3>
                  <span className="text-xs font-mono text-[#45464d]">
                    {PRODUCTS.length} Available Items
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {PRODUCTS.map((prod) => {
                    const isSelected = selectedParts[activeSlot]?.id === prod.id;
                    return (
                      <div
                        key={prod.id}
                        onClick={() => handleSelectPart(activeSlot, prod)}
                        className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#f0edef] border-[#000000] shadow-sm'
                            : 'bg-[#fcf8fa] border-[#c6c6cd] hover:border-[#000000] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-12 h-12 object-cover rounded-lg border border-[#c6c6cd]"
                          />
                          <div>
                            <span className="text-[10px] font-mono text-[#dc2626] font-bold">{prod.sku}</span>
                            <h4 className="font-bold text-xs text-[#000000] line-clamp-1">{prod.name}</h4>
                            <p className="text-[10px] font-mono text-[#45464d]">
                              Vendor: <span className="font-semibold text-black">{prod.vendorName}</span> | {prod.stockStatus}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-xs font-bold text-[#000000] block">
                            Rs. {prod.priceNpr.toLocaleString('en-IN')}
                          </span>
                          <button
                            className={`mt-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded transition-all ${
                              isSelected
                                ? 'bg-[#10b981] text-white'
                                : 'bg-[#000000] text-white hover:bg-[#1f2937]'
                            }`}
                          >
                            {isSelected ? 'SELECTED' : 'ADD TO RIG'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">touch_app</span>
                <p className="font-bold text-sm text-[#000000]">Select a slot on the left to pick components</p>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer Summary */}
        <div className="bg-[#f0edef] p-4 sm:p-5 border-t border-[#c6c6cd] flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 text-xs font-mono">
            <div>
              <span className="text-[#45464d] block text-[10px]">ESTIMATED POWER</span>
              <span className="font-bold text-[#000000] text-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-amber-500">bolt</span>
                {totalEstimatedWattage} Watts
              </span>
            </div>
            <div className="border-l border-[#c6c6cd] pl-6">
              <span className="text-[#45464d] block text-[10px]">TOTAL RIG ESTIMATE</span>
              <span className="font-bold text-[#dc2626] text-base sm:text-lg tabular-nums">
                Rs. {totalPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => setSelectedParts({})}
              className="px-4 py-2 border border-[#c6c6cd] text-xs font-mono font-bold text-[#45464d] rounded-lg hover:bg-white transition-all"
            >
              Clear All
            </button>
            <button
              disabled={selectedProductsList.length === 0}
              onClick={handleConfirmBuild}
              className={`flex-1 sm:flex-initial px-6 py-2.5 text-xs font-mono font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 btn-press shadow-md ${
                selectedProductsList.length > 0
                  ? 'bg-[#dc2626] hover:bg-[#b91c1c] text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
              Add {selectedProductsList.length} Items to Cart
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
