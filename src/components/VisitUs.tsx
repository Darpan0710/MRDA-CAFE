import React, { useState } from 'react';
import { ArrowUpRight, Copy, Check, Instagram, Phone, Mail } from 'lucide-react';
import { CAFE_DETAILS } from '../data/cafeData';
import { useCafeSettings } from '../services/cafeSettings';

interface VisitUsProps {
  onOpenDirections: () => void;
  onOpenBooking: () => void;
  onOpenMenu: () => void;
  onNavigateToSpace: () => void;
  onNavigateToAdmin?: () => void;
  isActive: boolean;
}

export const VisitUs: React.FC<VisitUsProps> = ({
  onOpenDirections,
  onOpenBooking,
  onOpenMenu,
  onNavigateToSpace,
  onNavigateToAdmin,
  isActive,
}) => {
  const [copied, setCopied] = useState(false);
  const settings = useCafeSettings();
  const address = settings.address || CAFE_DETAILS.address;
  const hours = settings.hours || CAFE_DETAILS.hours;
  const phone = settings.phone || CAFE_DETAILS.phone;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="visit"
      className="snap-full-section justify-between pt-16 sm:pt-20 lg:pt-22 pb-6 md:pb-8 px-4 sm:px-6 md:px-12 bg-[#F1E9DC] overflow-y-auto lg:overflow-hidden"
    >
      <div className="max-w-[1400px] w-full mx-auto flex-1 flex flex-col justify-center my-auto">
        
        {/* ================= VISIT US MAIN CONTENT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch lg:max-h-[520px]">
          
          {/* Left Column: Authentic Café Architecture Photograph (The Inner Room) */}
          <div className="lg:col-span-7 xl:col-span-8 relative min-h-[260px] sm:min-h-[320px] lg:max-h-[480px] rounded-xs overflow-hidden shadow-sm bg-[#292723] group border border-[#DCCBB4]/60">
            <img
              src="/MDRA/images/cafe/cafe-1.jpg"
              alt="MRDĀ inner room with sunlit handcrafted wooden pivot frames"
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-102"
              onError={(e) => {
                e.currentTarget.src = '/MDRA/featured/ref_visitus.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            
            <div className="absolute top-4 left-4 pointer-events-none">
              <span className="text-[10px] font-mono tracking-widest text-[#FFF3DF] bg-black/50 backdrop-blur-xs px-3 py-1 uppercase rounded-xs">
                The Inner Pavilion · Ahmedabad
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono tracking-widest text-[#FFF3DF]/90 uppercase pointer-events-none">
              <span>Natural Sunlight &amp; Shadows</span>
              <span>The Claywalls</span>
            </div>
          </div>

          {/* Right Column: Clean, Proportionate Information Card */}
          <div
            className="lg:col-span-5 xl:col-span-4 bg-[#F1E9DC] p-5 sm:p-7 md:p-8 rounded-xs border border-[#DCCBB4] shadow-xs flex flex-col justify-between transition-opacity duration-300"
          >
            <div>
              {/* Starburst Glyph */}
              <div className="text-[#873A35] text-xl font-serif mb-2">
                ✦
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-editorial-sans uppercase tracking-[0.06em] text-[#292723] font-normal mb-3">
                Visit Us
              </h2>

              {/* Verified Address */}
              <div className="flex items-start justify-between gap-2 mb-3 pb-3 border-b border-[#DCCBB4]/60">
                <p className="text-xs sm:text-sm text-[#70452D] leading-relaxed font-light">
                  {address}
                </p>
                <button
                  onClick={handleCopy}
                  className="p-1.5 border border-[#DCCBB4] hover:border-[#873A35] rounded-xs text-[#70452D] hover:text-[#873A35] hover:bg-[#FFF3DF] transition-colors text-xs inline-flex items-center gap-1 shrink-0 cursor-pointer"
                  title="Copy Address"
                >
                  {copied ? <Check size={12} className="text-emerald-700" /> : <Copy size={12} />}
                  <span className="text-[10px] font-mono">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Operating Hours Bar */}
              <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-[#DCCBB4]/60">
                <div>
                  <span className="block text-[10px] font-mono tracking-widest uppercase text-[#70452D]/80">
                    Operating Hours
                  </span>
                  <span className="text-xs sm:text-sm font-mono text-[#292723] font-medium">
                    {hours}
                  </span>
                </div>

                {/* Desktop-only Directions button in card (on mobile, directions is in dedicated footer section below) */}
                <button
                  onClick={onOpenDirections}
                  className="hidden lg:inline-flex items-center gap-1 text-xs font-semibold tracking-wider uppercase text-[#873A35] hover:text-[#70452D] transition-colors cursor-pointer shrink-0 border-b border-[#873A35]/40 hover:border-[#873A35] pb-0.5"
                >
                  <span>Directions</span>
                  <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>

              {/* Telephone & Email Direct Links */}
              <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#DCCBB4]/60 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase text-[#70452D]/70 tracking-wider">Tel:</span>
                  <a
                    href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                    className="text-[#292723] hover:text-[#873A35] font-medium underline decoration-[#DCCBB4] transition-colors"
                  >
                    {phone}
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase text-[#70452D]/70 tracking-wider">Email:</span>
                  <a
                    href="mailto:hello@atmrda.com"
                    className="text-[#292723] hover:text-[#873A35] underline decoration-[#DCCBB4] transition-colors"
                  >
                    hello@atmrda.com
                  </a>
                </div>
              </div>

              <div className="text-xs text-[#70452D] font-light leading-relaxed mb-4">
                Walk-ins are always welcomed warmly. For groups or specific table requests, reserve in advance.
              </div>
            </div>

            {/* Primary Action: Book Table */}
            <button
              onClick={onOpenBooking}
              className="w-full bg-[#873A35] hover:bg-[#70452D] text-[#FFF3DF] text-xs font-semibold tracking-[0.18em] uppercase py-3 rounded-full transition-colors cursor-pointer shadow-xs text-center hover:scale-[1.01] active:scale-[0.99]"
            >
              Reserve a Table
            </button>
          </div>

        </div>

      </div>

      {/* ================= DEDICATED MOBILE FOOTER (CLEAN VERTICAL STRUCTURE) ================= */}
      <footer className="block lg:hidden w-full max-w-[1400px] mx-auto mt-10 pt-8 border-t-2 border-[#DCCBB4]/80 text-[#292723] space-y-6">
        
        {/* 1. MRDĀ Brand Logo and Tagline */}
        <div className="space-y-1 text-left">
          <div className="inline-flex items-center gap-2">
            <span className="font-editorial-sans text-2xl font-bold tracking-[0.18em] uppercase text-[#292723]">
              MRDĀ
            </span>
            <span className="text-[#873A35] text-sm">✦</span>
          </div>
          <p className="font-mono text-xs uppercase tracking-wider text-[#70452D]">
            A quiet place for good conversations · Ahmedabad
          </p>
        </div>

        {/* 2. Navigation Links Arranged in a Readable Two-Column Grid */}
        <div className="space-y-2 text-left">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#873A35] font-semibold block">
            Navigation
          </span>
          <nav
            aria-label="Mobile footer navigation"
            className="grid grid-cols-2 gap-y-2.5 gap-x-6 text-xs sm:text-sm font-mono uppercase tracking-[0.16em] text-[#70452D]"
          >
            <a
              href="#hero"
              className="hover:text-[#873A35] transition-colors py-1 cursor-pointer block"
            >
              Home
            </a>
            <button
              onClick={onOpenMenu}
              className="hover:text-[#873A35] transition-colors cursor-pointer text-left py-1 block"
            >
              Menu
            </button>
            <button
              onClick={onNavigateToSpace}
              className="hover:text-[#873A35] transition-colors cursor-pointer text-left py-1 block"
            >
              The Space
            </button>
            <a
              href="/events"
              className="hover:text-[#873A35] transition-colors py-1 cursor-pointer block"
            >
              Events
            </a>
          </nav>
        </div>

        {/* 3. Complete Café Address with Clearly Visible Directions Link (Single Instance) */}
        <div className="space-y-2 text-left">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#873A35] font-semibold block">
            Location
          </span>
          <p className="text-xs font-mono text-[#70452D] leading-relaxed max-w-md">
            {address}
          </p>
          <div>
            <button
              onClick={onOpenDirections}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold tracking-wider uppercase text-[#873A35] hover:text-[#70452D] transition-colors border-b border-[#873A35]/50 hover:border-[#873A35] pb-0.5 pt-1 cursor-pointer"
              aria-label="Open directions modal"
            >
              <span>Get Directions</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

        {/* 4. Contact Information with Clickable Phone Number */}
        <div className="space-y-1 text-left">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#873A35] font-semibold block">
            Telephone
          </span>
          <a
            href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#292723] hover:text-[#873A35] underline decoration-[#DCCBB4] transition-colors"
          >
            <Phone size={12} className="text-[#873A35]" />
            <span>{phone}</span>
          </a>
        </div>

        {/* 5. Email with Clickable Mail Link */}
        <div className="space-y-1 text-left">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#873A35] font-semibold block">
            Email
          </span>
          <a
            href="mailto:hello@atmrda.com"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#292723] hover:text-[#873A35] underline decoration-[#DCCBB4] transition-colors"
          >
            <Mail size={12} className="text-[#873A35]" />
            <span>hello@atmrda.com</span>
          </a>
        </div>

        {/* 6. Opening Hours */}
        <div className="space-y-1 text-left">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#873A35] font-semibold block">
            Opening Hours
          </span>
          <p className="text-xs font-mono text-[#292723]">
            {hours}
          </p>
        </div>

        {/* 7. Copyright & Brand Tagline at Bottom */}
        <div className="pt-6 border-t border-[#DCCBB4]/60 space-y-2 text-[11px] font-mono text-[#70452D]/80">
          <div className="flex items-center justify-between gap-4">
            <span>© {new Date().getFullYear()} MRDĀ CAFÉ · ALL RIGHTS RESERVED</span>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/at.mrda/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#873A35] transition-colors p-1 inline-flex items-center gap-1.5"
                aria-label="MRDĀ on Instagram (@at.mrda)"
              >
                <Instagram size={14} className="text-[#873A35]" />
                <span className="text-xs font-mono">@at.mrda</span>
              </a>
              {onNavigateToAdmin && (
                <button
                  onClick={onNavigateToAdmin}
                  className="hover:text-[#873A35] uppercase transition-colors cursor-pointer text-[10px] opacity-70 hover:opacity-100 font-mono tracking-wider"
                  title="Hospitality Management Console"
                >
                  Admin
                </button>
              )}
            </div>
          </div>
          <div className="tracking-widest text-[#873A35]">
            मृदा · ROOTED IN CLAY &amp; SLOW CONVERSATIONS
          </div>
        </div>

      </footer>

      {/* ================= DOCKED MINIMAL FOOTER STRIP (DESKTOP ONLY) ================= */}
      <footer className="hidden lg:flex max-w-[1400px] w-full mx-auto pt-4 border-t border-[#DCCBB4]/60 items-center justify-between gap-4 text-xs font-mono text-[#70452D]/80 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-editorial-sans font-bold uppercase tracking-wider text-[#292723]">
            MRDĀ ✦
          </span>
          <span>·</span>
          <span>6th Floor, Claywalls, Zydus Hospital Road, Thaltej, Ahmedabad</span>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={onOpenMenu} className="hover:text-[#873A35] uppercase transition-colors cursor-pointer py-1">
            Menu
          </button>
          <button onClick={onNavigateToSpace} className="hover:text-[#873A35] uppercase transition-colors cursor-pointer py-1">
            The Space
          </button>
          <a
            href="https://www.instagram.com/at.mrda/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#873A35] transition-colors py-1 inline-flex items-center gap-1.5"
            aria-label="MRDĀ on Instagram (@at.mrda)"
          >
            <Instagram size={14} className="text-[#873A35]" />
            <span className="text-xs font-mono">@at.mrda</span>
          </a>
          {onNavigateToAdmin && (
            <button
              onClick={onNavigateToAdmin}
              className="hover:text-[#873A35] uppercase transition-colors cursor-pointer text-[10px] opacity-60 hover:opacity-100 font-mono tracking-wider py-1"
              title="Hospitality Management Console"
            >
              Admin
            </button>
          )}
        </div>
      </footer>
    </section>
  );
};
