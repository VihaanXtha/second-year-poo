import React from 'react';
import { COMMUNITY_BUILDS } from '../data/hardwareData';
import { CommunityBuild } from '../types';

interface CommunityBuildsSectionProps {
  onSelectBuild: (build: CommunityBuild) => void;
}

export const CommunityBuildsSection: React.FC<CommunityBuildsSectionProps> = ({ onSelectBuild }) => {
  return (
    <section className="py-16 bg-[#ffffff]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-[#000000] tracking-tight">Community Builds</h2>
          <p className="text-sm text-[#45464d] mt-2 max-w-2xl mx-auto">
            Explore impressive rigs and projects built using components sourced from our verified marketplace vendors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {COMMUNITY_BUILDS.map((build) => (
            <div
              key={build.id}
              className="group border border-[#c6c6cd] rounded overflow-hidden hover:border-[#dc2626] transition-all bg-[#ffffff] shadow-sm hover:shadow"
            >
              <div className="h-48 bg-[#f6f3f5] relative overflow-hidden">
                <img
                  src={build.image}
                  alt={build.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-sm text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded border border-white/20">
                  Rs. {build.priceNpr.toLocaleString('en-IN')}
                </div>
                <div className="absolute top-2.5 left-2.5 bg-[#0f172a]/90 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                  {build.category}
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-[#000000] text-lg mb-0.5 group-hover:text-[#dc2626] transition-colors">
                  {build.title}
                </h3>
                <p className="text-xs text-[#45464d] mb-4 font-medium">{build.subtitle}</p>

                <button
                  onClick={() => onSelectBuild(build)}
                  className="w-full border border-[#c6c6cd] text-[#000000] text-xs font-mono font-bold py-2.5 rounded hover:bg-[#f0edef] hover:border-[#000000] transition-colors flex justify-center items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                  View Parts List
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
