import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Calendar, Sparkles, RefreshCw, AlertCircle, Clock, MapPin } from 'lucide-react';
import { publicApi } from '../services/publicApi';
import { evaluateEventStatus } from '../utils/dateUtils';
import { EventMediaOrContentPanel } from './EventMediaOrContentPanel';

export interface LiveEventItem {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  description: string;
  performers?: string;
  venue?: string;
  published?: boolean;
  posterImage?: string;
  spots?: string;
}

interface UpcomingEventsSectionProps {
  onNavigateToEvents: () => void;
  onNavigateToSpace?: () => void;
  onOpenBooking?: () => void;
  isActive?: boolean;
  initialEvents?: LiveEventItem[];
}

export const UpcomingEventsSection: React.FC<UpcomingEventsSectionProps> = ({
  onNavigateToEvents,
  onNavigateToSpace,
  onOpenBooking,
  isActive = true,
  initialEvents,
}) => {
  const [events, setEvents] = useState<LiveEventItem[]>(initialEvents || []);
  const [isLoading, setIsLoading] = useState(!initialEvents);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  // Periodically refresh current time every 30s to react dynamically to Asia/Kolkata event end times
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const loadEvents = useCallback(async () => {
    if (initialEvents) {
      setEvents(initialEvents);
      setIsLoading(false);
      setFetchError(null);
      return;
    }

    try {
      setIsLoading(true);
      setFetchError(null);
      const res = await publicApi.fetchEvents();
      if (res && Array.isArray(res.events)) {
        setEvents(res.events);
      } else {
        setEvents([]);
      }
    } catch (err: any) {
      console.error('[UpcomingEventsSection] Failed to fetch events:', err);
      setFetchError(err.message || 'Unable to connect to events service');
    } finally {
      setIsLoading(false);
    }
  }, [initialEvents]);

  // Initial load and re-fetch whenever section becomes active
  useEffect(() => {
    if (isActive) {
      loadEvents();
    }
  }, [isActive, loadEvents]);

  // Window focus listener: immediately reflects admin changes when returning from another tab
  useEffect(() => {
    const handleFocus = () => {
      if (isActive) {
        loadEvents();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isActive, loadEvents]);

  // Filter strictly for upcoming published events in Asia/Kolkata timezone
  // Sort chronologically by earliest next start timestamp so the soonest event appears first
  const upcomingList = (events || [])
    .filter((e) => e.published !== false)
    .map((e) => {
      const status = evaluateEventStatus(e, currentTime);
      return { event: e, status };
    })
    .filter((item) => item.status.isUpcoming)
    .sort((a, b) => (a.status.startTimestamp || 0) - (b.status.startTimestamp || 0));

  const hasUpcoming = upcomingList.length > 0;
  const featured = hasUpcoming ? upcomingList[0] : null;

  const featuredBadge = featured
    ? (featured.status.nextOccurrence?.dateFormatted || featured.event.date).toUpperCase()
    : '';

  return (
    <section
      id="events"
      className="snap-full-section justify-center py-6 sm:py-8 lg:py-10 px-5 sm:px-8 md:px-12 bg-[#F1E9DC] border-t border-[#DCCBB4]/70 transition-all duration-700 relative overflow-hidden"
    >
      {/* Decorative concentric circular line art in bottom-right corner (matching approved reference) */}
      <svg
        className="absolute -bottom-14 -right-14 w-80 h-80 pointer-events-none text-[#DCCBB4]/45 select-none"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="200" cy="200" r="180" stroke="currentColor" strokeWidth="1" />
        <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="1" />
        <circle cx="200" cy="200" r="120" stroke="currentColor" strokeWidth="1" />
        <circle cx="200" cy="200" r="90" stroke="currentColor" strokeWidth="1" />
      </svg>

      <div className="max-w-[1160px] w-full mx-auto my-auto flex flex-col justify-center space-y-5 sm:space-y-6 relative z-10">

        {/* ================= STATE 1: LOADING SKELETON ================= */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 w-36 bg-[#DCCBB4]/60 rounded-xs" />
            <div className="h-10 w-3/5 bg-[#DCCBB4]/70 rounded-xs" />
            <div className="h-56 w-full bg-[#DCCBB4]/40 rounded-2xl" />
          </div>
        ) : fetchError && !hasUpcoming ? (
          /* ================= STATE 2: API ERROR FALLBACK ================= */
          <div className="w-full flex flex-col items-center justify-center text-center py-6 sm:py-8">
            <div className="bg-[#FFF9F2] border border-[#E5D7C7] rounded-2xl p-6 sm:p-10 max-w-xl w-full mx-auto space-y-4 shadow-2xs">
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.24em] text-[#873A35] font-semibold">
                <AlertCircle size={14} />
                <span>EVENTS &amp; GATHERINGS</span>
              </div>
              <h2 className="font-editorial-serif text-xl sm:text-2xl text-[#292723] font-medium leading-snug tracking-tight">
                Unable to load upcoming gatherings
              </h2>
              <p className="text-xs sm:text-sm text-[#70452D] font-light leading-relaxed max-w-md mx-auto">
                We are experiencing a temporary connection issue reaching the events service. You can retry loading or explore our café spaces and reservations directly.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={loadEvents}
                  className="inline-flex items-center gap-2 bg-[#873A35] hover:bg-[#70452D] text-[#FFF3DF] text-xs font-semibold tracking-[0.16em] uppercase px-5 py-2.5 rounded-full transition-all duration-300 shadow-xs cursor-pointer active:scale-98"
                >
                  <RefreshCw size={13} />
                  <span>Try Again</span>
                </button>
                {onNavigateToSpace && (
                  <button
                    onClick={onNavigateToSpace}
                    className="inline-flex items-center gap-1.5 border border-[#70452D]/35 hover:border-[#70452D] text-[#70452D] hover:text-[#292723] text-xs font-mono uppercase tracking-wider px-4 py-2.5 rounded-full transition-colors cursor-pointer"
                  >
                    <span>The Space</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : hasUpcoming && featured ? (
          /* ================= STATE A: APPROVED SINGLE LARGE FEATURED EVENT CARD ================= */
          <div className="space-y-4 sm:space-y-5">
            {/* Heading Row: 03 — UPCOMING EVENTS | Gatherings at The Claywalls | EXPLORE ALL EVENTS → */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#DCCBB4]/80 pb-3 sm:pb-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-[#873A35] font-semibold">
                    03 &mdash; UPCOMING EVENTS
                  </span>
                </div>
                <h2
                  onClick={onNavigateToEvents}
                  className="font-editorial-serif text-3xl sm:text-4xl lg:text-[2.65rem] text-[#292723] font-medium leading-[1.1] tracking-tight hover:text-[#873A35] transition-colors cursor-pointer"
                >
                  Gatherings at The Claywalls
                </h2>
              </div>

              <button
                onClick={onNavigateToEvents}
                className="group inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#873A35] hover:text-[#70452D] font-semibold transition-colors cursor-pointer pb-0.5 border-b border-[#873A35]/60 hover:border-[#70452D] self-start sm:self-end"
              >
                <span>EXPLORE ALL EVENTS</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>

            {/* Exactly One Large Featured Event Card (matching reference mockup) */}
            <div className="bg-[#FFF9F2] border border-[#E5D7C7] rounded-2xl p-5 sm:p-7 lg:p-8 shadow-[0_4px_24px_rgba(112,69,45,0.04)] grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center relative">
              
              {/* Left Side: Portrait Event Poster in natural aspect ratio with subtle vertical divider on desktop */}
              <div className="md:col-span-4 lg:col-span-4 flex justify-center md:border-r md:border-[#E5D7C7]/70 md:pr-6 lg:pr-8">
                <div className="w-full max-w-[260px] sm:max-w-[280px] aspect-[4/5] rounded-xl overflow-hidden bg-[#FAF4EB] border border-[#E5D7C7]/80 shadow-xs flex items-center justify-center">
                  <EventMediaOrContentPanel
                    event={featured.event}
                    badgeText={featuredBadge}
                    isUpcoming={true}
                    theme="cream"
                    aspectClass="w-full h-full aspect-[4/5]"
                    onClick={onNavigateToEvents}
                  />
                </div>
              </div>

              {/* Right Side: Category, Title, Description, Metadata Row & CTAs */}
              <div className="md:col-span-8 lg:col-span-8 flex flex-col justify-between space-y-4 lg:space-y-5">
                <div className="space-y-2.5">
                  
                  {/* Category Pill */}
                  <span className="inline-block px-3.5 py-1 bg-[#F1E0D6] text-[#873A35] font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase rounded-full w-fit">
                    {featured.event.type || 'TASTING & SENSORY'}
                  </span>

                  {/* Title */}
                  <h3
                    onClick={onNavigateToEvents}
                    className="font-editorial-serif text-2xl sm:text-3xl lg:text-[2rem] text-[#292723] font-medium leading-tight hover:text-[#873A35] transition-colors cursor-pointer"
                  >
                    {featured.event.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#70452D] font-light leading-relaxed max-w-xl">
                    {featured.event.description}
                  </p>

                  {/* Metadata Row: Calendar | Clock | MapPin */}
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 text-xs font-mono text-[#292723] pt-1">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Calendar size={13} className="text-[#873A35] shrink-0" />
                      <span>{featuredBadge}</span>
                    </span>
                    <span className="text-[#DCCBB4] hidden sm:inline" aria-hidden="true">|</span>
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Clock size={13} className="text-[#873A35] shrink-0" />
                      <span>{featured.event.time}</span>
                    </span>
                    <span className="text-[#DCCBB4] hidden sm:inline" aria-hidden="true">|</span>
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <MapPin size={13} className="text-[#873A35] shrink-0" />
                      <span>{featured.event.venue ? featured.event.venue.split(',')[0] : 'The Brew Bar Counter'}</span>
                    </span>
                  </div>
                </div>

                {/* Action Buttons: Primary RESERVE A TABLE → + Secondary DETAILS */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {onOpenBooking && (
                    <button
                      onClick={onOpenBooking}
                      className="inline-flex items-center justify-center gap-2 bg-[#873A35] hover:bg-[#70452D] text-[#FFF3DF] text-xs font-mono font-semibold tracking-widest uppercase px-7 py-3 rounded-full transition-all duration-200 cursor-pointer shadow-xs active:scale-98 w-full sm:w-auto"
                    >
                      <span>RESERVE A TABLE</span>
                      <span className="text-sm">→</span>
                    </button>
                  )}
                  <button
                    onClick={onNavigateToEvents}
                    className="inline-flex items-center justify-center border border-[#873A35]/60 hover:border-[#873A35] text-[#873A35] hover:bg-[#873A35]/5 text-xs font-mono font-semibold tracking-widest uppercase px-7 py-3 rounded-full transition-colors cursor-pointer w-full sm:w-auto"
                  >
                    <span>DETAILS</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        ) : (
          /* ================= STATE B: APPROVED CAFÉ DISCOVERY STATE (NO UPCOMING EVENTS) ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            
            {/* Left Column: Café Discovery Editorial Narrative */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-[0.24em] text-[#873A35] font-semibold">
                    THE ATELIER ✦ THE SPACE
                  </span>
                  <span className="h-[1px] w-8 bg-[#873A35]/35" aria-hidden="true" />
                </div>

                <h2 className="font-editorial-serif text-2xl sm:text-3xl lg:text-4xl text-[#292723] font-medium leading-[1.1] tracking-tight">
                  Good coffee. Good company. Something is always brewing.
                </h2>

                <p className="text-xs sm:text-sm text-[#70452D] font-light leading-relaxed max-w-md">
                  While our calendar of upcoming cuppings, music sessions, and communal salons is being curated, the café remains open daily. Step into our sunlit courtyard, explore our seasonal single-origin roasts, and find a slow corner overlooking Ahmedabad.
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#70452D]">
                  <span className="inline-flex items-center gap-1.5 bg-[#FFF9F2] border border-[#E5D7C7] px-3 py-1.5 rounded-xs">
                    <Clock size={12} className="text-[#873A35]" />
                    <span>Open Daily · 8:00 AM – 11:00 PM</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-[#FFF9F2] border border-[#E5D7C7] px-3 py-1.5 rounded-xs">
                    <MapPin size={12} className="text-[#873A35]" />
                    <span>The Claywalls · 6th Floor</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex flex-wrap items-center gap-3">
                {onNavigateToSpace && (
                  <button
                    onClick={onNavigateToSpace}
                    className="group inline-flex items-center gap-2 bg-[#873A35] text-[#FFF3DF] text-xs font-semibold tracking-[0.16em] uppercase px-5 sm:px-6 py-2.5 rounded-full hover:bg-[#70452D] active:scale-98 transition-all duration-300 shadow-xs cursor-pointer"
                  >
                    <span>Explore The Space</span>
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </button>
                )}

                {onOpenBooking && (
                  <button
                    onClick={onOpenBooking}
                    className="inline-flex items-center gap-2 border border-[#70452D]/35 hover:border-[#70452D] text-[#70452D] hover:text-[#292723] text-xs font-mono uppercase tracking-wider px-5 py-2.5 rounded-full transition-colors cursor-pointer"
                  >
                    <span>Reserve a Table</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Curated Café Discovery Imagery */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 items-center">
                
                {/* Courtyard Garden Framing */}
                <div
                  onClick={onNavigateToSpace || onNavigateToEvents}
                  role="button"
                  tabIndex={0}
                  aria-label="Explore The Courtyard at MRDĀ"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') (onNavigateToSpace || onNavigateToEvents)();
                  }}
                  className="group cursor-pointer bg-[#FFF9F2] border border-[#E5D7C7] p-2 rounded-xl shadow-xs hover:shadow-md transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/5] max-h-[240px] sm:max-h-[260px] overflow-hidden rounded-lg bg-[#E7DDD0]">
                    <img
                      src="/MDRA/featured/ref_more_left.jpg"
                      alt="MRDĀ sunlit courtyard garden with olive tree"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-104"
                      onError={(e) => {
                        e.currentTarget.src = '/MDRA/images/cafe/cafe-7.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-2.5 left-2.5 bg-[#1A1815]/80 backdrop-blur-xs px-2 py-0.5 rounded-xs text-[10px] font-mono tracking-widest text-[#FFF3DF] uppercase flex items-center gap-1.5">
                      <Sparkles size={11} className="text-[#873A35]" />
                      <span>The Courtyard</span>
                    </div>
                  </div>
                  <div className="pt-2 px-1 flex items-center justify-between text-[#70452D]">
                    <span className="font-editorial-sans text-xs font-medium">Open-Air Seating</span>
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-1 text-[#873A35]" />
                  </div>
                </div>

                {/* Slow Coffee Bar Framing */}
                <div
                  onClick={onNavigateToSpace || onNavigateToEvents}
                  role="button"
                  tabIndex={0}
                  aria-label="Explore the Brew Bar at MRDĀ"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') (onNavigateToSpace || onNavigateToEvents)();
                  }}
                  className="group cursor-pointer bg-[#FFF9F2] border border-[#E5D7C7] p-2 rounded-xl shadow-xs hover:shadow-md transition-all duration-500 hover:-translate-y-1 hidden sm:block"
                >
                  <div className="relative aspect-[4/5] max-h-[240px] sm:max-h-[260px] overflow-hidden rounded-lg bg-[#E7DDD0]">
                    <img
                      src="/MDRA/images/cafe/cafe-1.jpg"
                      alt="MRDĀ slow coffee bar counter and espresso machine"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-104"
                      onError={(e) => {
                        e.currentTarget.src = '/MDRA/images/cafe/cafe-2.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-2.5 left-2.5 bg-[#1A1815]/80 backdrop-blur-xs px-2 py-0.5 rounded-xs text-[10px] font-mono tracking-widest text-[#FFF3DF] uppercase flex items-center gap-1.5">
                      <Sparkles size={11} className="text-[#873A35]" />
                      <span>Slow Coffee Bar</span>
                    </div>
                  </div>
                  <div className="pt-2 px-1 flex items-center justify-between text-[#70452D]">
                    <span className="font-editorial-sans text-xs font-medium">Micro-Lot Roasts</span>
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-1 text-[#873A35]" />
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
