import React from 'react';
import { COMMUNITY_BUILDS } from '../data/hardwareData';
import { CommunityBuild } from '../types';

interface CommunityBuildsSectionProps {
  onSelectBuild: (build: CommunityBuild) => void;
  onCloneBuild?: (build: CommunityBuild) => void;
}

export const CommunityBuildsSection: React.FC<CommunityBuildsSectionProps> = ({
  onSelectBuild,
  onCloneBuild,
}) => {
  return (
    <section className="py-16 bg-[#ffffff]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-1.5 bg-[#f0edef] px-3 py-1 rounded-full text-xs font-mono text-[#dc2626] font-bold mb-2">
            <span className="material-symbols-outlined text-[16px]">construction</span>
            <span>VERIFIED COMMUNITY RIGS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] tracking-tight">
            Featured Community Builds
          </h2>
          <p className="text-sm text-[#45464d] mt-2 max-w-xl mx-auto font-medium">
            Explore authentic rigs and server nodes built by creators using components sourced from Circuit Bazaar vendors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {COMMUNITY_BUILDS.map((build, idx) => (
            <div
              key={build.id}
              className={`animate-fade-in-up stagger-${idx + 1} group border border-[#c6c6cd] rounded-2xl overflow-hidden hover:border-[#dc2626] card-hover-lift-lg bg-[#ffffff] flex flex-col justify-between`}
            >
              <div>
                <div className="h-52 bg-[#f6f3f5] relative overflow-hidden img-zoom">
                  <img
                    src={build.image}
                    alt={build.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/50 via-transparent to-transparent group-hover:from-[#0f172a]/70 transition-all duration-500 pointer-events-none" />
                  
                  <div className="absolute bottom-3 right-3 bg-black/80 glass text-white text-xs font-mono font-bold px-3 py-1 rounded-xl border border-white/20 tabular-nums">
                    Rs. {build.priceNpr.toLocaleString('en-IN')}
                  </div>
                  
                  <div className="absolute top-3 left-3 bg-[#0f172a]/90 glass text-white text-[10px] font-mono px-2.5 py-1 rounded-lg font-bold">
                    {build.category}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-[#000000] text-lg mb-1 group-hover:text-[#dc2626] transition-colors duration-200">
                    {build.title}
                  </h3>
                  <p className="text-xs text-[#45464d] mb-4 font-medium leading-relaxed">{build.subtitle}</p>

                  <div className="bg-[#f0edef] rounded-xl p-3 text-xs font-mono space-y-1.5 mb-4">
                    <div className="flex justify-between text-[#76777d]">
                      <span>PARTS COUNT:</span>
                      <span className="font-bold text-black">{build.partsList.length} Items</span>
                    </div>
                    <div className="flex justify-between text-[#76777d]">
                      <span>WARRANTY:</span>
                      <span className="font-bold text-[#10b981]">Vendor Direct</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onSelectBuild(build)}
                  className="border border-[#c6c6cd] text-[#000000] text-xs font-mono font-bold py-2.5 rounded-xl hover:bg-[#f0edef] transition-all flex justify-center items-center gap-1 cursor-pointer btn-press"
                >
                  <span className="material-symbols-outlined text-[16px]">list</span>
                  Parts
                </button>
                {onCloneBuild && (
                  <button
                    onClick={() => onCloneBuild(build)}
                    className="bg-[#000000] hover:bg-[#1f2937] text-white text-xs font-mono font-bold py-2.5 rounded-xl transition-all flex justify-center items-center gap-1 cursor-pointer btn-press shadow-md"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    Clone Rig
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
