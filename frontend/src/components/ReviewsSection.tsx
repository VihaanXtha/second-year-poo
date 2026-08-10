import React from 'react';

const VERIFIED_REVIEWS = [
  {
    id: 1,
    name: 'Sujan Shrestha',
    location: 'New Road, Kathmandu',
    rating: 5,
    date: '3 days ago',
    verifiedSku: 'SKU-GPU-4080S',
    comment: 'Ordered RTX 4080 Super from Kathmandu Tech Hub. Received same day delivery with official brand warranty invoice!',
    avatar: 'S',
  },
  {
    id: 2,
    name: 'Prashant Karki',
    location: 'Kupondole, Lalitpur',
    rating: 5,
    date: '1 week ago',
    verifiedSku: 'SKU-CPU-7800X3D',
    comment: 'The spec comparison drawer helped me pick between 7800X3D and 14700K. Authentic item verified via SKU desk.',
    avatar: 'P',
  },
  {
    id: 3,
    name: 'Rohan Pokharel',
    location: 'New Road, Pokhara',
    rating: 5,
    date: '2 weeks ago',
    verifiedSku: 'SKU-MB-B650A',
    comment: 'Excellent customer service from Pokhara Hardware World. Built my custom gaming rig in 30 mins using Circuit Bazaar builder.',
    avatar: 'R',
  },
];

export const ReviewsSection: React.FC = () => {
  return (
    <section className="py-16 bg-[#f6f3f5] border-b border-[#c6c6cd]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-1.5 bg-[#ffffff] px-3 py-1 rounded-full text-xs font-mono text-emerald-600 font-bold border border-[#c6c6cd] mb-2 shadow-sm">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>100% VERIFIED NEPAL CUSTOMER REVIEWS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] tracking-tight">
            Trusted by Builders Across Nepal
          </h2>
          <p className="text-sm text-[#45464d] mt-1 max-w-lg mx-auto font-medium">
            Real feedback from verified buyers in Kathmandu Valley, Lalitpur, and Pokhara.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VERIFIED_REVIEWS.map((rev, idx) => (
            <div
              key={rev.id}
              className={`animate-fade-in-up stagger-${idx + 1} bg-[#ffffff] border border-[#c6c6cd] rounded-2xl p-6 shadow-sm card-hover-lift flex flex-col justify-between`}
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0f172a] text-white font-bold flex items-center justify-center font-mono text-sm">
                      {rev.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-black">{rev.name}</h4>
                      <p className="text-[11px] font-mono text-gray-500">{rev.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-[16px] font-fill">star</span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-[#45464d] leading-relaxed font-sans mb-4 italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-[#f0edef] flex justify-between items-center text-[10px] font-mono text-gray-500">
                <span className="bg-[#10b981]/10 text-emerald-700 px-2 py-0.5 rounded font-bold">
                  VERIFIED ITEM: {rev.verifiedSku}
                </span>
                <span>{rev.date}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
