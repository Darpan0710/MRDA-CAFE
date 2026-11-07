import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { DATE_SPECIFIC_PAST_POSTERS } from '../utils/dateUtils';

export interface EventData {
  id?: string;
  title: string;
  type: string;
  date: string;
  time: string;
  description: string;
  venue?: string;
  spots?: string;
  posterImage?: string | null;
}

interface EventMediaOrContentPanelProps {
  event: EventData;
  badgeText?: string;
  isUpcoming?: boolean;
  theme?: 'navy' | 'cream';
  className?: string;
  aspectClass?: string;
  onClick?: () => void;
}

// Known generic café stock photos that are not real event posters
const UNRELATED_CAFE_PHOTOS = new Set([
  '/mdra/featured/ref_events.jpg',
  '/mdra/featured/menu_cold_brew.jpg',
  '/mdra/images/cafe/cafe-8.jpg',
  '/mdra/featured/ref_more_left.jpg',
  '/mdra/images/cafe/cafe-1.jpg',
]);

export const EventMediaOrContentPanel: React.FC<EventMediaOrContentPanelProps> = ({
  event,
  badgeText,
  isUpcoming = true,
  theme = 'cream',
  className = '',
  aspectClass = 'aspect-[4/5]',
  onClick,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const rawImage = (event.posterImage || '').trim();
  const lowerImage = rawImage.toLowerCase();

  // If this is an upcoming event, never show posters from past specific events or unrelated café stock photos
  const isPastEventPosterForUpcoming = isUpcoming && DATE_SPECIFIC_PAST_POSTERS.has(rawImage);
  const isUnrelatedCafePhoto = UNRELATED_CAFE_PHOTOS.has(lowerImage);

  // Valid poster check: must be a real event poster, not past poster, not café stock photo, and not broken
  const hasValidImage =
    !!rawImage &&
    !isPastEventPosterForUpcoming &&
    !isUnrelatedCafePhoto &&
    !imageFailed;

  const displayBadge = badgeText || event.date;

  // 1. IF A VALID POSTER EXISTS: Display original image in natural portrait proportions using object-contain
  if (hasValidImage) {
    return (
      <div
        onClick={onClick}
        className={`relative ${aspectClass} w-full overflow-hidden flex items-center justify-center select-none group cursor-pointer bg-[#FAF4EB] ${className}`}
      >
        <img
          src={rawImage}
          alt={event.title}
          className="w-full h-full object-contain p-1 transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          onError={() => setImageFailed(true)}
        />

        {/* Top-left date / occurrence badge */}
        <div className="absolute top-2.5 left-2.5 bg-[#1A1815]/90 backdrop-blur-xs px-2.5 py-0.5 rounded-xs text-[10px] font-mono tracking-widest text-[#FFF3DF] uppercase flex items-center gap-1.5 border border-[#FFF3DF]/15 z-10 pointer-events-none shadow-xs">
          <Sparkles size={10} className="text-[#873A35]" />
          <span>{displayBadge}</span>
        </div>
      </div>
    );
  }

  // 2. IF NO VALID POSTER (or broken URL): Render the approved clean editorial placard
  // Exact match to the approved reference design (Cream textured background, MRDĀ header, serif title, ceramic cup & botanical illustration, terracotta accent arch)
  return (
    <div
      onClick={onClick}
      className={`relative ${aspectClass} w-full overflow-hidden p-5 sm:p-6 flex flex-col justify-between items-center text-center select-none transition-all duration-300 group cursor-pointer bg-[#FAF4EB] ${className}`}
    >
      {/* Background Graphic: Terracotta Curved Accent Arch in bottom-right corner */}
      <div
        className="absolute -bottom-6 -right-6 w-32 h-32 rounded-tl-full bg-[#B55845]/90 pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* Background Graphic: Delicate Botanical Leaves Line Art on top-right */}
      <svg
        className="absolute top-2 right-2 w-16 h-16 text-[#70452D]/25 pointer-events-none z-0"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        aria-hidden="true"
      >
        <path d="M60 4C45 15 35 32 32 45" />
        <path d="M45 10c-3 8-10 12-18 13 8-3 12-10 18-13z" />
        <path d="M52 20c-4 7-11 10-18 10 7-3 11-8 18-10z" />
        <path d="M38 28c-3 6-9 8-15 9 6-3 10-7 15-9z" />
      </svg>

      {/* Background Graphic: Delicate Botanical Leaves Line Art on bottom-left */}
      <svg
        className="absolute bottom-3 left-2 w-16 h-16 text-[#70452D]/25 pointer-events-none z-0"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        aria-hidden="true"
      >
        <path d="M4 60C15 45 32 35 45 32" />
        <path d="M10 45c8-3 12-10 13-18-3 8-10 12-13 18z" />
        <path d="M20 52c7-4 10-11 10-18-3 7-8 11-10 18z" />
      </svg>

      {/* Top Header: Brand Wordmark + Star + Category */}
      <div className="relative z-10 flex flex-col items-center space-y-1 pt-1">
        <span className="font-editorial-serif text-sm font-semibold tracking-[0.28em] text-[#292723] uppercase">
          MRDĀ
        </span>
        <span className="text-[#873A35] text-[10px] leading-none">✦</span>
        <div className="flex items-center gap-2 pt-0.5">
          <span className="h-[1px] w-4 bg-[#70452D]/30" aria-hidden="true" />
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#70452D] font-semibold">
            {event.type || 'TASTING & SENSORY'}
          </span>
          <span className="h-[1px] w-4 bg-[#70452D]/30" aria-hidden="true" />
        </div>
      </div>

      {/* Center: Event Title in Cormorant Garamond */}
      <div className="relative z-10 my-auto py-2 px-1 max-w-[220px]">
        <h4 className="font-editorial-serif text-xl sm:text-2xl text-[#292723] font-medium leading-tight group-hover:text-[#873A35] transition-colors line-clamp-3">
          {event.title}
        </h4>
      </div>

      {/* Bottom Center: Minimalist Ceramic Coffee Cup Illustration with Rising Steam */}
      <div className="relative z-10 pb-2 flex flex-col items-center">
        <svg
          viewBox="0 0 80 50"
          className="w-24 h-15 text-[#292723]"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          {/* Delicate Steam Wisps */}
          <path
            d="M36 8c0 3-2 5-2 8"
            stroke="#70452D"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M44 6c0 4-2 6-2 10"
            stroke="#70452D"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Cup Body */}
          <path
            d="M24 22h32v10a12 12 0 0 1-12 12h-8a12 12 0 0 1-12-12V22Z"
            stroke="#292723"
            strokeWidth="1.4"
            strokeLinejoin="round"
            fill="#FFFBF5"
          />

          {/* Coffee Liquid Surface */}
          <ellipse
            cx="40"
            cy="22"
            rx="15"
            ry="3.5"
            fill="#3D2012"
            stroke="#292723"
            strokeWidth="1.2"
          />

          {/* Cup Handle */}
          <path
            d="M56 25h5a4 4 0 0 1 0 8h-5"
            stroke="#292723"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />

          {/* Saucer */}
          <ellipse
            cx="40"
            cy="45"
            rx="28"
            ry="4.5"
            stroke="#292723"
            strokeWidth="1.4"
            fill="#FFFBF5"
          />
        </svg>
      </div>
    </div>
  );
};
