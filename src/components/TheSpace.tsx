import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface TheSpaceProps {
  onNavigateToSpace: () => void;
  isActive: boolean;
}

export const TheSpace: React.FC<TheSpaceProps> = ({
  onNavigateToSpace,
  isActive,
}) => {
  return (
    <section
      id="space"
      className="snap-full-section justify-between pt-20 md:pt-22 pb-6 md:pb-8 px-6 md:px-12 bg-[#F1E9DC]"
    >
      <div className="max-w-[1400px] w-full mx-auto flex-1 flex flex-col justify-center">
        
        {/* Editorial 3-Column Composition tailored for 100svh laptop screens */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center h-full max-h-[580px]">
          
          {/* Left Column: Courtyard Garden Image with subtle zoom/parallax */}
          <div className="lg:col-span-4 h-full hidden lg:flex items-center justify-center">
            <div className="relative w-full aspect-[3/4] max-h-[500px] overflow-hidden rounded-xs bg-[#DCCBB4]/30 shadow-xs group">
              <img
                src="/MDRA/featured/ref_more_left.jpg"
                alt="MRDĀ courtyard garden table with olive tree"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                onError={(e) => {
                  e.currentTarget.src = '/MDRA/images/cafe/cafe-7.jpg';
                }}
              />
              <div className="absolute bottom-3 left-3 pointer-events-none">
                <span className="text-[10px] font-mono tracking-widest text-[#FFF3DF] bg-black/40 backdrop-blur-xs px-2.5 py-0.5 uppercase rounded-xs">
                  The Courtyard
                </span>
              </div>
            </div>
          </div>

          {/* Center Column: Core Manifesto & Story Link */}
          <div
            className="lg:col-span-4 text-center px-4 sm:px-6 py-4 flex flex-col items-center justify-center transition-opacity duration-300"
          >
            {/* Asterisk / Starburst Mark from Brand Identity */}
            <div className="mb-4 text-[#873A35] text-2xl font-serif">
              ✦
            </div>

            {/* Section Headline */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl leading-[1.15] font-editorial-sans uppercase tracking-[0.06em] text-[#292723] font-normal mb-4">
              More than<br />a café
            </h2>

            {/* Approved Narrative Prose */}
            <p className="text-[#70452D] text-xs sm:text-sm leading-relaxed font-light mb-6 max-w-sm">
              Mrda is a space for slow mornings, long conversations and everything in between. Designed with intention, rooted in the city, and open to all who find joy in the little things.
            </p>

            {/* Spatial Character Points (Clean unboxed metadata) */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-[#70452D]/80 uppercase tracking-widest mb-6">
              <span>Breeze Blocks</span>
              <span>·</span>
              <span>Cast Terrazzo</span>
              <span>·</span>
              <span>Shaded Sky</span>
            </div>

            {/* Explore Space Button */}
            <button
              onClick={onNavigateToSpace}
              className="group inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-semibold text-[#873A35] border-b border-[#873A35]/50 pb-1 hover:border-[#873A35] hover:text-[#70452D] transition-all cursor-pointer"
            >
              <span>Explore The Space</span>
              <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>

          {/* Right Column: Colonnade Corridor Photo (Exact Match from Reference) */}
          <div className="lg:col-span-4 h-full flex items-center justify-center">
            <div className="relative w-full aspect-[3/4] max-h-[500px] overflow-hidden rounded-xs bg-[#DCCBB4]/30 shadow-xs group">
              <img
                src="/MDRA/images/cafe/cafe-9.jpg"
                alt="MRDĀ architectural colonnade walkway with round terrazzo tables"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                onError={(e) => {
                  e.currentTarget.src = '/MDRA/images/cafe/cafe-4.jpg';
                }}
              />
              <div className="absolute bottom-3 right-3 pointer-events-none">
                <span className="text-[10px] font-mono tracking-widest text-[#FFF3DF] bg-black/40 backdrop-blur-xs px-2.5 py-0.5 uppercase rounded-xs">
                  The Colonnade
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
