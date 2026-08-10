"use client";

import React, { useState, useEffect } from 'react';

const RECENT_ORDERS = [
  { name: 'Aayush S.', location: 'Kathmandu', item: 'ASUS ROG Strix B650-A Gaming WiFi', timeAgo: '2 mins ago' },
  { name: 'Prashant K.', location: 'Lalitpur', item: 'NVIDIA RTX 4070 Super 12GB', timeAgo: '7 mins ago' },
  { name: 'Sabin R.', location: 'Pokhara', item: 'G.Skill Trident Z5 Neo 32GB DDR5', timeAgo: '12 mins ago' },
  { name: 'Kiran T.', location: 'Bhaktapur', item: 'Samsung 990 PRO 2TB NVMe SSD', timeAgo: '18 mins ago' },
  { name: 'Rohan P.', location: 'Kathmandu', item: 'MikroTik RB5009UG+S+IN Router', timeAgo: '24 mins ago' },
];

export const LiveTrustTicker: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % RECENT_ORDERS.length);
        setIsVisible(true);
      }, 500);
    }, 7000);

    return () => clearInterval(interval);
  }, [isDismissed]);

  if (isDismissed) return null;

  const currentOrder = RECENT_ORDERS[currentIndex];

  return (
    <div
      className={`fixed bottom-4 left-4 z-40 max-w-xs transition-all duration-500 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="bg-[#0f172a] text-white border border-[#1e293b] rounded-xl p-3 shadow-2xl flex items-center gap-3 relative group">
        <div className="w-9 h-9 rounded-lg bg-[#dc2626]/20 border border-[#dc2626]/40 flex items-center justify-center text-[#dc2626] shrink-0">
          <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
        </div>

        <div className="overflow-hidden">
          <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE ORDER &bull; {currentOrder.location}
          </div>
          <p className="text-xs font-bold text-white truncate max-w-[190px]">
            {currentOrder.item}
          </p>
          <p className="text-[10px] font-mono text-gray-400">
            {currentOrder.name} &bull; {currentOrder.timeAgo}
          </p>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="absolute -top-1.5 -right-1.5 bg-gray-800 text-gray-400 hover:text-white rounded-full w-5 h-5 flex items-center justify-center text-[12px] shadow-sm border border-gray-700"
          title="Dismiss live order alerts"
        >
          &times;
        </button>
      </div>
    </div>
  );
};
