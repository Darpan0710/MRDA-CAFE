import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface CombinedMenuProps {
  onOpenBeverages: () => void;
  onOpenFood: () => void;
  isActive: boolean;
}

export const CombinedMenu: React.FC<CombinedMenuProps> = ({
  onOpenBeverages,
  onOpenFood,
  isActive,
}) => {
  return (
    <section
      id="menu"
      className="snap-full-section pt-16 md:pt-18 bg-[#F1E9DC]"
    >
      {/* 
        Two distinct categories: POURED (beverages) and PLATED (food)
        - POURED: deep terracotta / brick red (#873A35) with warm ivory (#FFF3DF)
        - PLATED: warm cream (#F1E9DC) with brick red (#873A35) headline
        - Scaled fluid typography with clamp() to prevent overlapping or clipping
        - Balanced vertical rhythm, consistent aspect ratios, refined hover effects
        - Desktop: side-by-side balanced 2-panel spread
        - Tablet & Mobile: cleanly stacked without clipped heights
      */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-2 h-full overflow-hidden">
        
        {/* ================= LEFT PANEL: POURED (BEVERAGES) ================= */}
        <div
          className="bg-[#873A35] text-[#FFF3DF] flex flex-col justify-between p-6 sm:p-8 lg:p-9 xl:p-12 h-full overflow-hidden transition-opacity duration-300"
        >
          {/* Top Label & Category Kicker */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#FFF3DF]/20 shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs tracking-widest text-[#FFF3DF]/80 font-medium">
                01
              </span>
              <span className="h-[1px] w-8 sm:w-16 bg-[#FFF3DF]/40" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#FFF3DF]/90 font-medium">
                BEVERAGES
              </span>
            </div>
            <span className="text-[10px] font-mono tracking-widest text-[#FFF3DF]/60 uppercase hidden sm:inline">
              Craft & Extraction
            </span>
          </div>

          {/* Heading & Narrative Prose - Fluid scaling with clamp() to eliminate overlapping */}
          <div 
            onClick={onOpenBeverages}
            className="my-auto py-2 sm:py-3 space-y-2 shrink-0 cursor-pointer group/title"
          >
            <h2
              style={{ fontSize: 'clamp(2.2rem, 3.8vw, 4.25rem)' }}
              className="font-editorial-display font-extrabold tracking-tight uppercase leading-[0.95] text-[#FFF3DF] group-hover/title:text-[#FFF3DF]/80 transition-colors"
            >
              POURED
            </h2>
            <p className="text-xs sm:text-sm text-[#FFF3DF]/85 font-light leading-relaxed max-w-sm">
              Brewed gently, poured with thought. Single origins, slow cold brews, and botanical coffee craft.
            </p>
          </div>

          {/* Featured Beverage Photograph - 4:3 natural aspect ratio matching photo */}
          <div
            onClick={onOpenBeverages}
            className="group relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] max-h-[190px] sm:max-h-[210px] lg:max-h-[210px] xl:max-h-[240px] overflow-hidden rounded-xs bg-[#70452D] shadow-xs cursor-pointer shrink my-1"
          >
            <img
              src="/MDRA/featured/ref_poured.jpg"
              alt="MRDĀ poured specialty beverage"
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = '/MDRA/images/for video/drink-1.jpg';
              }}
            />
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-xs uppercase tracking-widest text-[#FFF3DF] bg-[#873A35]/90 px-3.5 py-1.5 rounded-full backdrop-blur-xs shadow-xs">
                Explore Beverages ↗
              </span>
            </div>
          </div>

          {/* Bottom Bar: Category Captions & Refined Action Button */}
          <div className="pt-3 sm:pt-4 border-t border-[#FFF3DF]/20 flex items-center justify-between gap-4 shrink-0">
            <span className="text-[11px] font-mono tracking-widest text-[#FFF3DF]/70 uppercase truncate">
              Cold Brews · Manual Brews · Signatures · Teas
            </span>

            <button
              onClick={onOpenBeverages}
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase px-4 py-2 rounded-full border border-[#FFF3DF]/40 hover:bg-[#FFF3DF] hover:text-[#873A35] text-[#FFF3DF] transition-all shrink-0 cursor-pointer group active:scale-95"
            >
              <span>View Menu</span>
              <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

        {/* ================= RIGHT PANEL: PLATED (FOOD) ================= */}
        <div
          className="bg-[#F1E9DC] text-[#292723] flex flex-col justify-between p-6 sm:p-8 lg:p-9 xl:p-12 h-full overflow-hidden border-t lg:border-t-0 lg:border-l border-[#DCCBB4] transition-opacity duration-300"
        >
          {/* Top Label & Category Kicker */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#DCCBB4] shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs tracking-widest text-[#70452D] font-medium">
                02
              </span>
              <span className="h-[1px] w-8 sm:w-16 bg-[#70452D]/40" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#70452D] font-medium">
                FOOD
              </span>
            </div>
            <span className="text-[10px] font-mono tracking-widest text-[#70452D]/60 uppercase hidden sm:inline">
              Honest & Seasonal
            </span>
          </div>

          {/* Heading & Narrative Prose - Fluid scaling with clamp() to eliminate overlapping */}
          <div 
            onClick={onOpenFood}
            className="my-auto py-2 sm:py-3 space-y-2 shrink-0 cursor-pointer group/title"
          >
            <h2
              style={{ fontSize: 'clamp(2.2rem, 3.8vw, 4.25rem)' }}
              className="font-editorial-display font-extrabold tracking-tight uppercase leading-[0.95] text-[#873A35] group-hover/title:text-[#70452D] transition-colors"
            >
              PLATED
            </h2>
            <p className="text-xs sm:text-sm text-[#70452D] font-light leading-relaxed max-w-sm">
              Comforting plates, crafted with care. Sourdoughs, Daybreak oats, fresh salads, and slow-made sweet ends.
            </p>
          </div>

          {/* Featured Food Photograph - 4:3 natural aspect ratio matching photo */}
          <div
            onClick={onOpenFood}
            className="group relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] max-h-[190px] sm:max-h-[210px] lg:max-h-[210px] xl:max-h-[240px] overflow-hidden rounded-xs bg-[#DCCBB4]/40 shadow-xs cursor-pointer shrink my-1"
          >
            <img
              src="/MDRA/featured/ref_plated.jpg"
              alt="MRDĀ plated artisan food bowl"
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = '/MDRA/images/for video/food-3.webp';
              }}
            />
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-xs uppercase tracking-widest text-[#FFF3DF] bg-[#873A35]/90 px-3.5 py-1.5 rounded-full backdrop-blur-xs shadow-xs">
                Explore Food ↗
              </span>
            </div>
          </div>

          {/* Bottom Bar: Category Captions & Refined Action Button */}
          <div className="pt-3 sm:pt-4 border-t border-[#DCCBB4] flex items-center justify-between gap-4 shrink-0">
            <span className="text-[11px] font-mono tracking-widest text-[#70452D]/80 uppercase truncate">
              Daybreak · Sourdough · Salads · Sweet Ends
            </span>

            <button
              onClick={onOpenFood}
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase px-4 py-2 rounded-full border border-[#873A35]/40 hover:bg-[#873A35] hover:text-[#FFF3DF] text-[#873A35] transition-all shrink-0 cursor-pointer group active:scale-95"
            >
              <span>View Menu</span>
              <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
