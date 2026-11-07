import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  Sparkles,
  X,
  ZoomIn,
  MapPin,
  Calendar,
  Clock,
  Filter,
} from 'lucide-react';
import { Footer } from './Footer';
import { publicApi } from '../services/publicApi';
import { evaluateEventStatus } from '../utils/dateUtils';
import { EventMediaOrContentPanel } from './EventMediaOrContentPanel';

interface EventsPageProps {
  onNavigateHome: (sectionId?: string) => void;
  onOpenBooking: () => void;
  onNavigateToMenu: () => void;
  onNavigateToSpace: () => void;
}

interface EventPosterMeta {
  src: string;
  title: string;
  day?: string;
  date: string;
}

export interface LiveEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  description: string;
  performers?: string;
  venue?: string;
  published: boolean;
  posterImage?: string;
  spots?: string;
}

export interface DisplayEvent extends LiveEvent {
  nextOccurrenceFormatted?: string;
  isRecurring?: boolean;
  isUpcoming?: boolean;
  startTimestamp?: number;
}

const CATEGORIES = [
  'All',
  'Cupping & Tasting',
  'Workshops',
  'Conversations',
  'Music',
] as const;

type CategoryFilter = (typeof CATEGORIES)[number];

export const EventsPage: React.FC<EventsPageProps> = ({
  onNavigateHome,
  onOpenBooking,
  onNavigateToMenu,
  onNavigateToSpace,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [lightboxPoster, setLightboxPoster] = useState<EventPosterMeta | null>(null);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  // Periodically refresh current time every 30s so event statuses update seamlessly
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live published events from server
  useEffect(() => {
    publicApi
      .fetchEvents()
      .then((res) => {
        if (res && res.events) {
          setLiveEvents(res.events);
          setEventsLoaded(true);
        }
      })
      .catch((err) => {
        console.error('[EventsPage] Failed to fetch events:', err);
      });
  }, []);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxPoster(null);
      }
    };
    if (lightboxPoster) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxPoster]);

  // Separate events strictly into upcoming vs past based on IST timing
  const { upcomingEvents, pastEvents } = useMemo(() => {
    const upcoming: DisplayEvent[] = [];
    const past: DisplayEvent[] = [];

    (liveEvents || [])
      .filter((e) => e.published !== false)
      .forEach((e) => {
        const status = evaluateEventStatus(e, currentTime);
        const item: DisplayEvent = {
          ...e,
          nextOccurrenceFormatted: status.nextOccurrence?.dateFormatted,
          isRecurring: status.isRecurring,
          isUpcoming: status.isUpcoming,
          startTimestamp: status.startTimestamp,
        };

        if (status.isUpcoming) {
          upcoming.push(item);
        } else {
          past.push(item);
        }
      });

    // Upcoming sorted chronologically by soonest start timestamp
    upcoming.sort((a, b) => (a.startTimestamp || 0) - (b.startTimestamp || 0));

    // Past events sorted in reverse chronological order
    past.sort((a, b) => (b.startTimestamp || 0) - (a.startTimestamp || 0));

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [liveEvents, currentTime]);

  // Apply optional category filter
  const filteredUpcoming = useMemo(() => {
    if (selectedCategory === 'All') return upcomingEvents;
    const cat = selectedCategory.toLowerCase();
    return upcomingEvents.filter((e) => {
      const type = (e.type || '').toLowerCase();
      const title = (e.title || '').toLowerCase();
      if (cat.includes('cupping') && (type.includes('cupping') || title.includes('cupping') || type.includes('tasting'))) return true;
      if (cat.includes('workshop') && (type.includes('workshop') || title.includes('brew') || title.includes('art'))) return true;
      if (cat.includes('conversation') && (type.includes('salon') || type.includes('samvaad') || title.includes('salon') || title.includes('stories'))) return true;
      if (cat.includes('music') && (type.includes('music') || type.includes('dj') || title.includes('dj') || title.includes('set'))) return true;
      return type.includes(cat) || title.includes(cat);
    });
  }, [upcomingEvents, selectedCategory]);

  const featuredUpcoming = filteredUpcoming.length > 0 ? filteredUpcoming[0] : null;
  const remainingUpcoming = filteredUpcoming.length > 1 ? filteredUpcoming.slice(1) : [];

  return (
    <div className="min-h-screen w-full bg-[#F1E9DC] text-[#292723] pt-20 md:pt-24 pb-0 selection:bg-[#873A35] selection:text-[#FFF3DF] overflow-x-hidden">
      
      {/* Lightbox Modal for Full Resolution Poster Viewing */}
      {lightboxPoster && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightboxPoster.title}
          onClick={() => setLightboxPoster(null)}
          className="fixed inset-0 z-50 bg-[#1A1815]/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full max-h-[90vh] bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs p-4 sm:p-5 flex flex-col justify-between cursor-default shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#DCCBB4]/70">
              <div className="space-y-0.5 pr-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#873A35] font-semibold block">
                  {lightboxPoster.day ? `${lightboxPoster.day} · ${lightboxPoster.date}` : lightboxPoster.date}
                </span>
                <h4 className="font-editorial-display text-lg sm:text-xl text-[#292723] font-medium line-clamp-1">
                  {lightboxPoster.title}
                </h4>
              </div>
              <button
                onClick={() => setLightboxPoster(null)}
                aria-label="Close poster preview"
                className="w-8 h-8 rounded-full border border-[#DCCBB4] bg-white hover:bg-[#873A35] hover:text-[#FFF3DF] text-[#292723] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X size={15} />
              </button>
            </div>

            <div className="my-auto py-3 max-h-[72vh] overflow-hidden flex items-center justify-center bg-[#FAF4EB] rounded-xs border border-[#DCCBB4]/50">
              <img
                src={lightboxPoster.src}
                alt={lightboxPoster.title}
                className="max-h-[68vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="pt-3 border-t border-[#DCCBB4]/70 flex items-center justify-between text-xs font-mono text-[#70452D]">
              <span>Official Event Artwork</span>
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center gap-1.5 text-[#873A35] hover:text-[#70452D] font-semibold uppercase tracking-wider cursor-pointer"
              >
                <span>Reserve a Table</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-[1240px] mx-auto px-5 sm:px-8 md:px-12 py-6 sm:py-8 space-y-12 sm:space-y-16">
        
        {/* ================= 1. CLEAN EDITORIAL HEADER ================= */}
        <section className="space-y-5 border-b border-[#DCCBB4]/80 pb-8 sm:pb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[#873A35] text-sm font-serif">✦</span>
              <span className="font-mono text-xs uppercase tracking-[0.24em] text-[#873A35] font-semibold">
                EVENTS &amp; GATHERINGS
              </span>
              <span className="h-[1px] w-8 bg-[#873A35]/40" aria-hidden="true" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#70452D] hidden sm:inline">
                AHMEDABAD
              </span>
            </div>

            <h1 className="font-editorial-display text-3xl sm:text-4xl lg:text-5xl text-[#292723] font-medium leading-[1.08] tracking-tight">
              Gatherings at The Claywalls
            </h1>

            <p className="text-sm sm:text-base text-[#70452D] font-light leading-relaxed max-w-2xl pt-1">
              Slow mornings, single-origin cuppings, intimate conversations, and sound sessions under the canopy. Join our weekly rituals, masterclasses, and community evenings.
            </p>
          </div>

          {/* Category Filters Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="text-xs font-mono text-[#70452D] uppercase tracking-wider flex items-center gap-1 mr-1">
              <Filter size={11} className="text-[#873A35]" />
              <span>Filter:</span>
            </span>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-mono uppercase tracking-wider px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#873A35] text-[#FFF3DF] font-semibold shadow-xs'
                      : 'bg-[#FFF3DF] border border-[#DCCBB4] text-[#70452D] hover:border-[#873A35]/70 hover:text-[#292723]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </section>

        {/* ================= 2. FEATURED UPCOMING EVENT ================= */}
        {featuredUpcoming ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#873A35] font-semibold flex items-center gap-1.5">
                <span>✦</span>
                <span>FEATURED GATHERING</span>
              </span>
              <span className="text-xs font-mono text-[#70452D]">
                {featuredUpcoming.nextOccurrenceFormatted || featuredUpcoming.date}
              </span>
            </div>

            {/* Desktop Two-Column Featured Card */}
            <div className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs p-6 sm:p-8 lg:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center hover:border-[#873A35]/50 transition-all">
              
              {/* Left Column: Portrait Artwork Poster (object-contain, 0% crop) */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-[340px] aspect-[4/5] rounded-xs overflow-hidden bg-[#FAF4EB] border border-[#DCCBB4]/70 shadow-xs flex items-center justify-center relative group">
                  <EventMediaOrContentPanel
                    event={featuredUpcoming}
                    badgeText={featuredUpcoming.nextOccurrenceFormatted || featuredUpcoming.date}
                    isUpcoming={true}
                    theme="cream"
                    aspectClass="w-full h-full aspect-[4/5]"
                    onClick={() => {
                      if (featuredUpcoming.posterImage) {
                        setLightboxPoster({
                          src: featuredUpcoming.posterImage,
                          title: featuredUpcoming.title,
                          date: featuredUpcoming.nextOccurrenceFormatted || featuredUpcoming.date,
                        });
                      } else {
                        onOpenBooking();
                      }
                    }}
                  />
                  {featuredUpcoming.posterImage && (
                    <div className="absolute inset-0 bg-[#292723]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4 pointer-events-none">
                      <div className="inline-flex items-center gap-1.5 bg-[#FFF3DF] text-[#292723] px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider shadow-sm">
                        <ZoomIn size={12} className="text-[#873A35]" />
                        <span>View Poster</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Event Information */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#DCCBB4]/60 pb-2.5">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#873A35] font-semibold">
                      {featuredUpcoming.type}
                    </span>
                    <span className="font-mono text-xs text-[#70452D] font-medium flex items-center gap-1">
                      <Clock size={12} className="text-[#873A35]" />
                      <span>{featuredUpcoming.time}</span>
                    </span>
                  </div>

                  <h2 className="font-editorial-display text-2xl sm:text-3xl lg:text-4xl text-[#292723] font-medium leading-tight">
                    {featuredUpcoming.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#873A35] bg-[#873A35]/5 px-3 py-1 rounded-xs border border-[#873A35]/15 font-semibold">
                      <Calendar size={12} />
                      <span>{featuredUpcoming.nextOccurrenceFormatted || featuredUpcoming.date}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#70452D] bg-[#F1E9DC] px-3 py-1 rounded-xs border border-[#DCCBB4]">
                      <MapPin size={12} className="text-[#873A35]" />
                      <span>{featuredUpcoming.venue || 'The Claywalls · 6th Floor'}</span>
                    </span>
                    {featuredUpcoming.spots && (
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-[#873A35] bg-[#FFF3DF] px-2.5 py-1 rounded-xs border border-[#DCCBB4]">
                        <Sparkles size={11} />
                        <span>{featuredUpcoming.spots}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-sm sm:text-base text-[#70452D] font-light leading-relaxed max-w-xl pt-1">
                    {featuredUpcoming.description}
                  </p>

                  {featuredUpcoming.performers && (
                    <div className="text-xs font-mono text-[#70452D] bg-[#F1E9DC] px-3.5 py-1.5 rounded-xs border border-[#DCCBB4] w-fit">
                      Conducted by: <span className="font-semibold text-[#292723]">{featuredUpcoming.performers}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#DCCBB4]/70 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={onOpenBooking}
                    className="inline-flex items-center gap-2 bg-[#873A35] hover:bg-[#70452D] text-[#FFF3DF] text-xs font-mono uppercase font-semibold tracking-wider px-6 sm:px-7 py-3 rounded-full transition-all cursor-pointer shadow-xs active:scale-98"
                  >
                    <span>Reserve a Table</span>
                    <ArrowRight size={13} />
                  </button>

                  {featuredUpcoming.posterImage && (
                    <button
                      onClick={() =>
                        setLightboxPoster({
                          src: featuredUpcoming.posterImage!,
                          title: featuredUpcoming.title,
                          date: featuredUpcoming.nextOccurrenceFormatted || featuredUpcoming.date,
                        })
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-[#70452D] hover:text-[#873A35] uppercase tracking-wider py-2 cursor-pointer transition-colors"
                    >
                      <ZoomIn size={13} />
                      <span>View Full Poster</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          </section>
        ) : eventsLoaded ? (
          /* Empty State when no upcoming events match filter */
          <div className="p-8 sm:p-12 bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs text-center space-y-3 max-w-xl mx-auto shadow-xs">
            <span className="text-2xl font-serif text-[#873A35]">✦</span>
            <h3 className="font-editorial-display text-2xl text-[#292723]">
              No Upcoming Gatherings in this Category
            </h3>
            <p className="text-xs sm:text-sm text-[#70452D] font-light leading-relaxed">
              We are finalizing our upcoming schedule for this series. Select &ldquo;All&rdquo; to view other sessions or check our past archives.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setSelectedCategory('All')}
                className="inline-flex items-center gap-1.5 bg-[#873A35] text-[#FFF3DF] text-xs font-mono uppercase tracking-wider px-5 py-2 rounded-full cursor-pointer"
              >
                <span>View All Categories</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* ================= 3. REMAINING UPCOMING EVENTS GRID ================= */}
        {remainingUpcoming.length > 0 && (
          <section className="space-y-6 pt-2">
            <div className="border-b border-[#DCCBB4]/80 pb-3">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#873A35] font-semibold block">
                UPCOMING SESSIONS
              </span>
              <h3 className="font-editorial-display text-2xl sm:text-3xl text-[#292723] font-medium pt-0.5">
                More Upcoming Gatherings
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {remainingUpcoming.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs overflow-hidden flex flex-col justify-between h-full shadow-xs hover:border-[#873A35]/60 transition-all duration-300 hover:-translate-y-0.5"
                >
                  {/* Top Media: 4:5 Portrait Poster uncropped, or minimal editorial panel */}
                  <EventMediaOrContentPanel
                    event={evt}
                    badgeText={evt.nextOccurrenceFormatted || evt.date}
                    isUpcoming={true}
                    theme="cream"
                    aspectClass="aspect-[4/5] max-h-[300px]"
                    onClick={() => {
                      if (evt.posterImage) {
                        setLightboxPoster({
                          src: evt.posterImage,
                          title: evt.title,
                          date: evt.nextOccurrenceFormatted || evt.date,
                        });
                      } else {
                        onOpenBooking();
                      }
                    }}
                  />

                  {/* Card Content Area */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3.5">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#DCCBB4]/60">
                        <span className="px-2.5 py-0.5 bg-[#873A35]/10 text-[#873A35] font-mono text-[10px] uppercase font-semibold tracking-widest rounded-full">
                          {evt.type}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-mono text-[#70452D] font-medium">
                          <Clock size={12} className="text-[#873A35]" />
                          <span>{evt.time}</span>
                        </div>
                      </div>

                      <h4 className="font-editorial-display text-xl text-[#292723] font-medium min-h-[2.75rem] flex items-center leading-snug">
                        {evt.title}
                      </h4>

                      <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#873A35] bg-[#873A35]/5 px-2.5 py-1 rounded-xs border border-[#873A35]/15">
                        <Calendar size={12} />
                        <span className="font-semibold">{evt.nextOccurrenceFormatted || evt.date}</span>
                      </div>

                      <p className="text-xs text-[#70452D]/85 font-light leading-relaxed min-h-[3rem] line-clamp-3">
                        {evt.description}
                      </p>

                      {evt.performers && (
                        <div className="text-[11px] font-mono text-[#70452D] bg-[#F1E9DC] px-2.5 py-1 rounded-xs border border-[#DCCBB4]">
                          Lead: <span className="font-semibold text-[#292723]">{evt.performers}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3.5 mt-2 border-t border-[#DCCBB4]/70 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] font-mono text-[#70452D]">
                        <MapPin size={11} className="text-[#873A35] shrink-0" />
                        <span className="truncate max-w-[120px]">{evt.venue ? evt.venue.split(',')[0] : 'The Claywalls'}</span>
                      </div>
                      <button
                        onClick={onOpenBooking}
                        className="inline-flex items-center gap-1.5 bg-[#873A35] hover:bg-[#70452D] text-[#FFF3DF] text-[11px] font-mono uppercase font-semibold tracking-wider px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer shadow-2xs hover:scale-102 active:scale-98"
                      >
                        <span>Reserve</span>
                        <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= 4. PAST EVENTS (PAST GATHERINGS) ================= */}
        {pastEvents.length > 0 && (
          <section id="past-gatherings" className="border-t-2 border-[#DCCBB4] pt-12 sm:pt-14 mt-16 sm:mt-20 space-y-8">
            <div className="space-y-2">
              <span className="font-mono text-xs uppercase tracking-[0.24em] text-[#873A35] font-semibold block">
                ARCHIVES &amp; SESSIONS RECORD
              </span>
              <h2 className="font-editorial-display text-2xl sm:text-3xl lg:text-4xl text-[#292723] font-medium">
                Past Gatherings
              </h2>
              <p className="text-xs sm:text-sm text-[#70452D] font-light max-w-2xl leading-relaxed">
                Archived sessions, cuppings, and community evenings hosted at The Claywalls. A record of our past gatherings and moments shared.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {pastEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs overflow-hidden flex flex-col justify-between shadow-2xs hover:border-[#873A35]/50 transition-all duration-300"
                >
                  {/* Top Media: 4:5 Portrait Poster uncropped */}
                  <EventMediaOrContentPanel
                    event={evt}
                    isUpcoming={false}
                    theme="cream"
                    aspectClass="aspect-[4/5] max-h-[300px]"
                    onClick={() => {
                      if (evt.posterImage) {
                        setLightboxPoster({
                          src: evt.posterImage,
                          title: evt.title,
                          date: evt.date,
                        });
                      }
                    }}
                  />

                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#DCCBB4]/60">
                        <span className="text-[10px] font-mono tracking-widest text-[#873A35] uppercase font-semibold">
                          {evt.type}
                        </span>
                        <span className="text-[10px] font-mono uppercase bg-[#873A35]/10 text-[#873A35] px-2.5 py-0.5 rounded-full font-semibold">
                          Concluded
                        </span>
                      </div>
                      <h4 className="font-editorial-display text-lg text-[#292723] font-medium leading-snug">
                        {evt.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-[#70452D]">
                        <Calendar size={12} className="text-[#873A35]" />
                        <span>{evt.date} · {evt.time}</span>
                      </div>
                      <p className="text-xs text-[#70452D]/85 font-light leading-relaxed line-clamp-3">
                        {evt.description}
                      </p>
                    </div>

                    {evt.performers && (
                      <div className="pt-2.5 border-t border-[#DCCBB4]/60 text-[11px] font-mono text-[#70452D]">
                        Conducted by: <span className="font-medium text-[#292723]">{evt.performers}</span>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Website Shared Footer */}
      <Footer
        onNavigateToMenu={onNavigateToMenu}
        onNavigateToSpace={onNavigateToSpace}
        onNavigateHome={onNavigateHome}
      />
    </div>
  );
};
