"use client";

import React, { useState } from 'react';

interface BottleneckCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRigBuilder: () => void;
}

const CPU_OPTIONS = [
  { id: 'cpu-1', name: 'AMD Ryzen 7 7800X3D', score: 98, watts: 105 },
  { id: 'cpu-2', name: 'Intel Core i7-14700K', score: 94, watts: 125 },
  { id: 'cpu-3', name: 'AMD Ryzen 5 7600X', score: 82, watts: 105 },
  { id: 'cpu-4', name: 'Intel Core i5-13400F', score: 72, watts: 65 },
];

const GPU_OPTIONS = [
  { id: 'gpu-1', name: 'NVIDIA RTX 4080 Super 16GB', score: 96, watts: 320 },
  { id: 'gpu-2', name: 'NVIDIA RTX 4070 Super 12GB', score: 84, watts: 220 },
  { id: 'gpu-3', name: 'AMD Radeon RX 7800 XT 16GB', score: 78, watts: 263 },
  { id: 'gpu-4', name: 'NVIDIA RTX 4060 8GB', score: 62, watts: 115 },
];

export const BottleneckCalculatorModal: React.FC<BottleneckCalculatorModalProps> = ({
  isOpen,
  onClose,
  onOpenRigBuilder,
}) => {
  const [selectedCpu, setSelectedCpu] = useState(CPU_OPTIONS[0]);
  const [selectedGpu, setSelectedGpu] = useState(GPU_OPTIONS[0]);
  const [resolution, setResolution] = useState<'1080p' | '1440p' | '4k'>('1440p');

  if (!isOpen) return null;

  // Calculate bottleneck estimation
  const diff = selectedGpu.score - selectedCpu.score;
  let bottleneckPct = Math.min(35, Math.max(2, Math.abs(diff) * 1.2));
  if (resolution === '4k') bottleneckPct = Math.max(2, Math.round(bottleneckPct * 0.5));
  if (resolution === '1080p') bottleneckPct = Math.round(bottleneckPct * 1.3);

  const isCpuBottleneck = selectedGpu.score > selectedCpu.score + 5;
  const isGpuBottleneck = selectedCpu.score > selectedGpu.score + 10;
  const isBalanced = !isCpuBottleneck && !isGpuBottleneck;

  const totalSystemWatts = selectedCpu.watts + selectedGpu.watts + 120; // 120W base for mobo, ram, fans
  const recommendedPsu = Math.ceil((totalSystemWatts * 1.3) / 50) * 50;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in-down overflow-y-auto">
      <div className="bg-[#ffffff] border border-[#c6c6cd] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-[#0f172a] text-white p-4 sm:p-5 flex justify-between items-center border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#38bdf8] text-2xl">speed</span>
            <div>
              <h3 className="font-bold text-lg text-white">CPU & GPU Bottleneck & Power Calculator</h3>
              <p className="text-xs font-mono text-gray-300">Nepal Verified Rig Hardware Compatibility</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            {/* CPU Selection */}
            <div>
              <label className="block text-[#45464d] font-bold mb-1">SELECT PROCESSOR (CPU)</label>
              <select
                value={selectedCpu.id}
                onChange={(e) => setSelectedCpu(CPU_OPTIONS.find(c => c.id === e.target.value) || CPU_OPTIONS[0])}
                className="w-full border border-[#c6c6cd] rounded-xl px-3 py-2 bg-white text-black font-bold focus:outline-none focus:border-black"
              >
                {CPU_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* GPU Selection */}
            <div>
              <label className="block text-[#45464d] font-bold mb-1">SELECT GRAPHICS CARD (GPU)</label>
              <select
                value={selectedGpu.id}
                onChange={(e) => setSelectedGpu(GPU_OPTIONS.find(g => g.id === e.target.value) || GPU_OPTIONS[0])}
                className="w-full border border-[#c6c6cd] rounded-xl px-3 py-2 bg-white text-black font-bold focus:outline-none focus:border-black"
              >
                {GPU_OPTIONS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Resolution Selector */}
          <div className="flex items-center justify-between bg-[#f0edef] p-3 rounded-xl border border-[#c6c6cd] font-mono text-xs">
            <span className="text-[#76777d] font-bold">TARGET DISPLAY RESOLUTION:</span>
            <div className="flex gap-2">
              {(['1080p', '1440p', '4k'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setResolution(r)}
                  className={`px-3 py-1 rounded-lg uppercase font-bold transition-all cursor-pointer ${
                    resolution === r
                      ? 'bg-[#000000] text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-[#c6c6cd]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Bottleneck Gauge Result */}
          <div className="bg-[#fcf8fa] border border-[#c6c6cd] rounded-2xl p-5 font-mono space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-[#76777d] block">ESTIMATED BOTTLENECK</span>
                <span className={`text-2xl font-bold ${isBalanced ? 'text-emerald-600' : 'text-[#dc2626]'}`}>
                  {bottleneckPct.toFixed(1)}% {isBalanced ? '(GREAT PAIRING)' : isCpuBottleneck ? '(CPU BOUND)' : '(GPU BOUND)'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#76777d] block">RECOMMENDED PSU</span>
                <span className="text-xl font-bold text-black flex items-center justify-end gap-1">
                  <span className="material-symbols-outlined text-amber-500 text-[20px]">bolt</span>
                  {recommendedPsu}W 80+ Gold
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${isBalanced ? 'bg-emerald-500' : 'bg-[#dc2626]'}`}
                style={{ width: `${Math.min(100, bottleneckPct * 2.5)}%` }}
              />
            </div>

            <p className="text-xs text-[#45464d] font-sans leading-relaxed">
              {isBalanced && `This pairing of ${selectedCpu.name} and ${selectedGpu.name} delivers excellent frame pacing and full component utilization at ${resolution}.`}
              {isCpuBottleneck && `${selectedCpu.name} may bottleneck ${selectedGpu.name} in high refresh-rate titles at ${resolution}. Consider upgrading to a Ryzen 7 7800X3D.`}
              {isGpuBottleneck && `${selectedGpu.name} is the primary limit for graphics throughput at ${resolution}. Consider an RTX 4070 Super or 4080 Super.`}
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-2 font-mono text-xs">
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-[#c6c6cd] font-bold rounded-xl hover:bg-[#f6f3f5]"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenRigBuilder();
              }}
              className="px-6 py-2.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold rounded-xl transition-all btn-press shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">construction</span>
              Build Rig with These Parts
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
