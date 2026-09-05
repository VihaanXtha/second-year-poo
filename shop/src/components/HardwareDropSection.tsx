import React, { useState, useEffect } from 'react';

export const HardwareDropSection: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 14,
    hours: 8,
    minutes: 45,
    seconds: 30,
  });
  const [reminderSet, setReminderSet] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSetReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setReminderSet(true);
      setShowModal(false);
    }
  };

  const timerBlocks = [
    { value: timeLeft.days, label: 'Days', isAccent: false },
    { value: timeLeft.hours, label: 'Hours', isAccent: false },
    { value: timeLeft.minutes, label: 'Mins', isAccent: false },
    { value: timeLeft.seconds, label: 'Secs', isAccent: true },
  ];

  return (
    <section className="py-12 bg-[#ffffff] border-b border-[#c6c6cd]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
          <span className="material-symbols-outlined text-[#dc2626] text-3xl">rocket_launch</span>
          <div>
            <h2 className="text-2xl font-bold text-[#000000] tracking-tight">Upcoming Nepal Hardware Drops</h2>
            <p className="text-xs font-mono text-[#45464d] mt-0.5">Pre-order allocation pipeline for new releases</p>
          </div>
        </div>

        <div className="animate-fade-in-up stagger-2 bg-[#f0edef] rounded-2xl border border-[#c6c6cd] overflow-hidden flex flex-col md:flex-row items-stretch shadow-lg hover:shadow-xl transition-shadow duration-300">
          
          {/* Left info box */}
          <div className="md:w-5/12 bg-[#0f172a] p-6 lg:p-8 flex flex-col justify-center text-white relative overflow-hidden">
            <div className="text-[#dc2626] font-mono text-xs uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#dc2626] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#dc2626]" />
              </span>
              LIMITED NEPAL ALLOCATION
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold mb-3 relative z-10">Next-Gen RTX 50 Series</h3>
            <p className="text-xs sm:text-sm text-gray-300 mb-4 leading-relaxed relative z-10">
              Reserve your GPU from the first batch landing in Kathmandu. Verified local warranty & official brand invoice included.
            </p>

            {/* Allocation Meter */}
            <div className="mb-6 relative z-10 font-mono text-xs">
              <div className="flex justify-between text-gray-300 mb-1">
                <span>Pre-reservation Batch:</span>
                <span className="text-emerald-400 font-bold">28 / 35 Claimed</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-white/10">
                <div className="h-full bg-gradient-to-r from-[#dc2626] to-amber-500 w-[80%] rounded-full animate-shimmer" />
              </div>
            </div>

            {reminderSet ? (
              <div className="bg-[#10b981]/20 border border-[#10b981] text-[#10b981] text-xs font-mono p-3 rounded-xl flex items-center gap-2 animate-scale-in relative z-10">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Reminder Active! We will SMS/Email you 1 hr prior.</span>
              </div>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="relative z-10 w-fit bg-[#ffffff] text-[#000000] font-bold px-6 py-3 rounded-xl text-xs sm:text-sm hover:bg-gray-100 transition-all duration-300 active:scale-95 flex items-center gap-2 cursor-pointer btn-press overflow-hidden group shadow-md"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:animate-bounce">notifications_active</span>
                Set Drop Alert
              </button>
            )}
          </div>

          {/* Right countdown timer */}
          <div className="md:w-7/12 p-8 flex flex-col justify-center items-center bg-[url('https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center relative min-h-[240px]">
            <div className="absolute inset-0 bg-[#0f172a]/85 backdrop-blur-[2px]"></div>
            
            <div className="relative z-10 flex gap-3 sm:gap-4 text-center">
              {timerBlocks.map((block, idx) => (
                <div
                  key={block.label}
                  className={`bg-white/10 glass border border-white/20 p-3 sm:p-4 rounded-xl text-white min-w-[70px] sm:min-w-[85px] hover:scale-105 transition-all duration-300 animate-fade-in-up stagger-${idx + 1}`}
                >
                  <div className={`font-mono text-2xl sm:text-3xl font-bold tabular-nums ${block.isAccent ? 'text-[#dc2626]' : ''}`}>
                    {String(block.value).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest mt-1 text-gray-300 font-mono">{block.label}</div>
                </div>
              ))}
            </div>

            <div className="relative z-10 mt-5 text-xs font-mono text-gray-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">verified</span>
              <span>Verified Nepal Vendor Queue Active</span>
            </div>
          </div>

        </div>
      </div>

      {/* Reminder Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#ffffff] rounded-2xl border border-[#c6c6cd] max-w-md w-full p-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#000000] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#dc2626]">notifications</span>
                Set Hardware Drop Alert
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#76777d] hover:text-black hover:rotate-90 transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-xs font-mono text-[#45464d] mb-4">
              Enter your email or phone number to receive instant notifications when pre-orders unlock in Nepal.
            </p>
            <form onSubmit={handleSetReminder} className="space-y-4 font-mono">
              <div>
                <label className="block text-xs font-bold text-[#45464d] mb-1">EMAIL / PHONE NUMBER</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. sujan@domain.np or 9841000000"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full border border-[#c6c6cd] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#000000]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#c6c6cd] text-xs font-bold rounded-xl hover:bg-[#f6f3f5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#dc2626] text-white text-xs font-bold rounded-xl hover:bg-[#b91c1c] btn-press"
                >
                  Confirm Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
