"use client";

import React, { useState } from 'react';

interface BecomeVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BecomeVendorModal: React.FC<BecomeVendorModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    panVat: '',
    ownerName: '',
    phone: '',
    location: 'Kathmandu',
    specialty: 'PC Components',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#ffffff] rounded-lg border border-[#c6c6cd] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="bg-[#0f172a] text-white p-6 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#38bdf8]">storefront</span>
            <h3 className="font-bold text-lg">Vendor Portal Registration</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-[#10b981]/20 rounded-full flex items-center justify-center text-[#10b981] mx-auto mb-3">
                <span className="material-symbols-outlined text-3xl">verified</span>
              </div>
              <h4 className="text-lg font-bold text-[#000000] mb-2">Application Submitted!</h4>
              <p className="text-xs text-[#45464d] font-mono leading-relaxed mb-6">
                Thank you, <span className="font-bold text-[#000000]">{formData.businessName}</span>. Our technical onboarding team will verify your PAN/VAT credentials (<span className="font-bold">{formData.panVat}</span>) within 24 business hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="px-6 py-2.5 bg-[#000000] text-white font-mono text-xs font-bold rounded hover:bg-[#1f2937]"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              <p className="text-[#45464d] leading-relaxed">
                Join Nepal's premier specification-first hardware network. Connect directly with PC builders, sysadmins, and IoT engineers nationwide.
              </p>

              <div>
                <label className="block font-bold text-[#45464d] mb-1">BUSINESS / STORE NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kathmandu Hardware Hub Pvt Ltd"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full border border-[#c6c6cd] rounded px-3 py-2 focus:outline-none focus:border-[#000000]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#45464d] mb-1">NEPAL PAN / VAT NO. *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 600123456"
                    value={formData.panVat}
                    onChange={(e) => setFormData({ ...formData, panVat: e.target.value })}
                    className="w-full border border-[#c6c6cd] rounded px-3 py-2 focus:outline-none focus:border-[#000000]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#45464d] mb-1">PHONE NUMBER *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +977 9801234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-[#c6c6cd] rounded px-3 py-2 focus:outline-none focus:border-[#000000]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#45464d] mb-1">PRIMARY LOCATION</label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full border border-[#c6c6cd] rounded px-3 py-2 bg-white"
                  >
                    <option value="Kathmandu">Kathmandu Valley</option>
                    <option value="Pokhara">Pokhara</option>
                    <option value="Lalitpur">Lalitpur</option>
                    <option value="Biratnagar">Biratnagar</option>
                    <option value="Chitwan">Chitwan</option>
                    <option value="Butwal">Butwal</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#45464d] mb-1">PRIMARY CATEGORY</label>
                  <select
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full border border-[#c6c6cd] rounded px-3 py-2 bg-white"
                  >
                    <option value="PC Components">PC Components</option>
                    <option value="IoT & Embedded">IoT & Embedded</option>
                    <option value="Laptops & Workstations">Laptops & Workstations</option>
                    <option value="Enterprise Networking">Enterprise Networking</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-[#c6c6cd] font-bold rounded hover:bg-[#f6f3f5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#dc2626] text-white font-bold rounded hover:bg-[#b91c1c]"
                >
                  Submit Application
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
