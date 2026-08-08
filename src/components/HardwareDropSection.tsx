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

  return (
    <section className="py-12 bg-[#ffffff] border-b border-[#c6c6cd]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-[#dc2626] text-3xl">rocket_launch</span>
          <h2 className="text-2xl font-bold text-[#000000] tracking-tight">Upcoming Hardware Drops</h2>
        </div>

        <div className="bg-[#f0edef] rounded-lg border border-[#c6c6cd] overflow-hidden flex flex-col md:flex-row items-stretch shadow-sm">
          <div className="md:w-5/12 bg-[#0f172a] p-6 lg:p-8 flex flex-col justify-center text-white">
            <div className="text-[#dc2626] font-mono text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626] animate-ping"></span>
              PRE-ORDER OPENING
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold mb-3">Next-Gen RTX 50 Series</h3>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              Secure your unit from the first batch arriving in Nepal. Limited stock available across verified vendors with official brand warranty.
            </p>

            {reminderSet ? (
              <div className="bg-[#10b981]/20 border border-[#10b981] text-[#10b981] text-xs font-mono p-3 rounded flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Reminder active! We'll alert you 1 hour before pre-orders open.</span>
              </div>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="w-fit bg-[#ffffff] text-[#000000] font-bold px-6 py-2.5 rounded text-sm hover:bg-gray-100 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                Set Reminder
              </button>
            )}
          </div>

          <div className="md:w-7/12 p-8 flex flex-col justify-center items-center bg-[url('https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center relative min-h-[220px]">
            <div className="absolute inset-0 bg-[#0f172a]/85 backdrop-blur-[2px]"></div>
            
            <div className="relative z-10 flex gap-3 sm:gap-4 text-center">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded text-white min-w-[70px] sm:min-w-[85px]">
                <div className="font-mono text-2xl sm:text-3xl font-bold">{String(timeLeft.days).padStart(2, '0')}</div>
                <div className="text-[10px] uppercase tracking-widest mt-1 text-gray-300 font-mono">Days</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded text-white min-w-[70px] sm:min-w-[85px]">
                <div className="font-mono text-2xl sm:text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
                <div className="text-[10px] uppercase tracking-widest mt-1 text-gray-300 font-mono">Hours</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded text-white min-w-[70px] sm:min-w-[85px]">
                <div className="font-mono text-2xl sm:text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div className="text-[10px] uppercase tracking-widest mt-1 text-gray-300 font-mono">Mins</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded text-white min-w-[70px] sm:min-w-[85px]">
                <div className="font-mono text-2xl sm:text-3xl font-bold text-[#dc2626]">{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div className="text-[10px] uppercase tracking-widest mt-1 text-gray-300 font-mono">Secs</div>
              </div>
            </div>

            <div className="relative z-10 mt-4 text-xs font-mono text-gray-400">
              Expected Stock: 35 Units allocated for Nepal
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Email Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#ffffff] rounded-lg border border-[#c6c6cd] max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#000000] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#dc2626]">notifications</span>
                Set Hardware Drop Alert
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#76777d] hover:text-black">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-sm text-[#45464d] mb-4">
              Enter your email or phone number to receive an immediate notification as soon as RTX 50 Series pre-orders open in Nepal.
            </p>
            <form onSubmit={handleSetReminder} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#45464d] mb-1">EMAIL / PHONE NUMBER</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. sthaushab4@gmail.com or 9801234567"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full border border-[#c6c6cd] rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#000000]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#c6c6cd] text-xs font-bold rounded hover:bg-[#f6f3f5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#dc2626] text-white text-xs font-bold rounded hover:bg-[#b91c1c]"
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
