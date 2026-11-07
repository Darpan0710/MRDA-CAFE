import React from 'react';
import { ArrowUpRight, Instagram } from 'lucide-react';
import { useCafeSettings } from '../services/cafeSettings';

export interface FooterProps {
  onNavigateHome: (sectionId?: string) => void;
  onNavigateToMenu?: (tab?: 'poured' | 'plated') => void;
  onNavigateToSpace?: () => void;
  onNavigateToEvents?: () => void;
  onOpenMenu?: () => void;
  onOpenStory?: () => void;
  onOpenVisit?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateHome,
  onNavigateToMenu,
  onNavigateToSpace,
  onNavigateToEvents,
  onOpenMenu,
  onOpenVisit,
}) => {
  const cafeSettings = useCafeSettings();

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateHome) {
      onNavigateHome('hero');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleMenuClick = () => {
    if (onNavigateToMenu) {
      onNavigateToMenu('poured');
    } else if (onOpenMenu) {
      onOpenMenu();
    } else if (onNavigateHome) {
      onNavigateHome('menu');
    }
  };

  const handleSpaceClick = () => {
    if (onNavigateToSpace) {
      onNavigateToSpace();
    } else if (onNavigateHome) {
      onNavigateHome('space');
    }
  };

  const handleEventsClick = () => {
    if (onNavigateToEvents) {
      onNavigateToEvents();
    } else if (onNavigateHome) {
      onNavigateHome('events');
    }
  };

  const handleVisitClick = () => {
    if (onOpenVisit) {
      onOpenVisit();
    } else if (onNavigateHome) {
      onNavigateHome('visit');
    }
  };

  return (
    <footer id="site-footer" className="w-full bg-[#F1E9DC] border-t border-[#DCCBB4] pt-8 pb-10 px-5 sm:px-6 md:px-12 text-[#292723]">
      <div className="max-w-[1400px] mx-auto space-y-6 sm:space-y-8">
        
        {/* Main Footer Container: Clean Vertical Layout on Mobile / Balanced Columns on Desktop */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-8 pb-6 md:pb-8 border-b border-[#DCCBB4]/60">
          
          {/* 1. Brand & Ahmedabad City Branding */}
          <div className="space-y-1 text-left">
            <button
              onClick={handleHomeClick}
              className="inline-flex items-center gap-2 group cursor-pointer text-left"
              aria-label="MRDĀ Homepage"
            >
              <span className="font-editorial-sans text-xl sm:text-2xl font-bold tracking-[0.18em] text-[#292723] group-hover:text-[#873A35] transition-colors">
                MRDĀ
              </span>
              <span className="text-[#873A35] text-sm">✦</span>
            </button>
            <p className="font-mono text-xs text-[#70452D] tracking-wider uppercase">
              A Space to Slow Down · Ahmedabad
            </p>
          </div>

          {/* 2. Navigation Links Group: Home, Menu, The Space, Events, Visit Us */}
          <div className="space-y-2 text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#873A35] font-semibold block md:hidden">
              Navigation
            </span>
            <nav
              aria-label="Footer navigation"
              className="grid grid-cols-2 sm:grid-cols-3 md:flex md:items-center gap-x-6 gap-y-2.5 text-xs font-mono uppercase tracking-[0.16em] text-[#70452D]"
            >
              <button
                onClick={handleHomeClick}
                className="hover:text-[#873A35] transition-colors cursor-pointer text-left py-1 block"
              >
                Home
              </button>
              <button
                onClick={handleMenuClick}
                className="hover:text-[#873A35] transition-colors cursor-pointer text-left py-1 block"
              >
                Menu
              </button>
              <button
                onClick={handleSpaceClick}
                className="hover:text-[#873A35] transition-colors cursor-pointer text-left py-1 block"
              >
                The Space
              </button>
              <button
                onClick={handleEventsClick}
                className="hover:text-[#873A35] transition-colors cursor-pointer text-left py-1 block"
              >
                Events
              </button>
              <button
                onClick={handleVisitClick}
                className="hover:text-[#873A35] transition-colors cursor-pointer text-left py-1 block"
              >
                Visit Us
              </button>
            </nav>
          </div>

          {/* 3. Location, Directions & Contact Information */}
          <div className="space-y-3 md:space-y-2 text-xs font-mono text-[#70452D] text-left md:text-right">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#873A35] font-semibold block md:hidden mb-1">
                Location
              </span>
              <a
                href={cafeSettings.googleMapsUrl || "https://www.google.com/maps/search/?api=1&query=MRD%C4%80+Caf%C3%A9%2C+6th+Floor%2C+Claywalls%2C+Zydus+Hospital+Road%2C+Opposite+Verantes%2C+Thaltej%2C+Ahmedabad%2C+Gujarat+380059"}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#873A35] transition-colors group inline-flex items-start md:items-center gap-1.5 leading-relaxed"
                title="View MRDĀ on Google Maps"
              >
                <span className="break-words">{cafeSettings.address}</span>
                <ArrowUpRight
                  size={13}
                  className="text-[#873A35] shrink-0 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all mt-0.5 md:mt-0"
                />
              </a>
            </div>

            <div className="pt-1 md:pt-0">
              <span className="text-[10px] uppercase tracking-widest text-[#873A35] font-semibold block md:hidden mb-1">
                Contact &amp; Hours
              </span>
              <div className="flex flex-wrap items-center md:justify-end gap-x-3 gap-y-1 text-xs">
                <a
                  href={`tel:${cafeSettings.phone.replace(/[^0-9+]/g, '')}`}
                  className="hover:text-[#873A35] underline decoration-[#DCCBB4] transition-colors font-semibold text-[#292723]"
                  title="Call MRDĀ Café"
                >
                  {cafeSettings.phone}
                </a>
                <span className="text-[#DCCBB4]">·</span>
                <a
                  href={`mailto:${cafeSettings.email || 'hello@atmrda.com'}`}
                  className="hover:text-[#873A35] underline decoration-[#DCCBB4] transition-colors text-[#292723]"
                  title="Email MRDĀ Café"
                >
                  {cafeSettings.email || 'hello@atmrda.com'}
                </a>
                <span className="text-[#DCCBB4]">·</span>
                <span>{cafeSettings.hours}</span>
              </div>
            </div>

            {/* Social Link: Instagram @at.mrda */}
            <div className="pt-1 flex items-center md:justify-end">
              <a
                href="https://www.instagram.com/at.mrda/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#873A35] transition-colors inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#70452D] group"
                aria-label="MRDĀ on Instagram (@at.mrda)"
              >
                <Instagram size={14} className="text-[#873A35] group-hover:scale-110 transition-transform" />
                <span className="underline decoration-[#DCCBB4]">@at.mrda</span>
                <ArrowUpRight size={12} className="text-[#873A35] opacity-75 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>

        </div>

        {/* Sub-Footer Row: Minimal Copyright, Instagram & Sanskrit Etymology Note */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] font-mono text-[#70452D]/80">
          <div>
            © {new Date().getFullYear()} MRDĀ CAFÉ · ALL RIGHTS RESERVED
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://www.instagram.com/at.mrda/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#873A35] transition-colors inline-flex items-center gap-1 text-[11px] text-[#70452D]"
              aria-label="Instagram profile @at.mrda"
            >
              <Instagram size={12} className="text-[#873A35]" />
              <span>@at.mrda</span>
            </a>
            <span className="text-[#DCCBB4]">·</span>
            <span className="tracking-widest text-[#873A35]">
              मृदा · ROOTED IN CLAY &amp; SLOW CONVERSATIONS
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
