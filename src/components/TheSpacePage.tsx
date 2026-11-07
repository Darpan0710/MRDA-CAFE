import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { CAFE_DETAILS } from '../data/cafeData';
import { Footer } from './Footer';

interface TheSpacePageProps {
  onNavigateHome: (sectionId?: string) => void;
  onOpenBooking: () => void;
  onNavigateToMenu: () => void;
  onNavigateToEvents: () => void;
}

export const TheSpacePage: React.FC<TheSpacePageProps> = ({
  onNavigateHome,
  onOpenBooking,
  onNavigateToMenu,
  onNavigateToEvents,
}) => {
  // All authentic café photos are 4:5 portrait (2926x3657 or similar)
  const heroPhotos = [
    {
      src: '/MDRA/images/cafe/cafe-2.jpg',
      alt: 'MRDĀ sunlit courtyard with terrazzo tables, wooden frames and breeze blocks',
      caption: 'The Sunlit Courtyard',
      tag: 'Cast Terrazzo & Breeze Blocks',
    },
    {
      src: '/MDRA/images/cafe/cafe-1.jpg',
      alt: 'MRDĀ inner room with wooden pivot frames and morning light',
      caption: 'The Inner Room',
      tag: 'Handcrafted Pivot Frames & Natural Light',
    },
    {
      src: '/MDRA/images/cafe/cafe-8.jpg',
      alt: 'MRDĀ long communal table and warm woven pendant lamps',
      caption: 'The Communal Table',
      tag: 'Solid Wood & Woven Pendant Domes',
    },
    {
      src: '/MDRA/images/cafe/cafe-6.jpg',
      alt: 'MRDĀ quiet vinyl listening corner and art volumes',
      caption: 'The Listening Nook',
      tag: 'Vinyl Records & Stone Texture',
    },
  ];

  const [heroIndex, setHeroIndex] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // Programmatic scroll to a specific slide index
  const scrollToSlide = (index: number) => {
    const container = galleryRef.current;
    if (!container) return;
    const slideWidth = container.clientWidth;
    isScrollingRef.current = true;
    container.scrollTo({
      left: index * slideWidth,
      behavior: 'smooth',
    });
    setHeroIndex(index);
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 450);
  };

  const prevHero = () => {
    const target = heroIndex === 0 ? heroPhotos.length - 1 : heroIndex - 1;
    scrollToSlide(target);
  };

  const nextHero = () => {
    const target = heroIndex === heroPhotos.length - 1 ? 0 : heroIndex + 1;
    scrollToSlide(target);
  };

  // Synchronize index when user naturally scrolls via touch, trackpad, or mouse-wheel
  const handleScroll = () => {
    if (isScrollingRef.current) return;
    const container = galleryRef.current;
    if (!container) return;
    const slideWidth = container.clientWidth;
    if (slideWidth > 0) {
      const index = Math.round(container.scrollLeft / slideWidth);
      const clamped = Math.max(0, Math.min(heroPhotos.length - 1, index));
      if (clamped !== heroIndex) {
        setHeroIndex(clamped);
      }
    }
  };

  // Natural vertical mouse-wheel conversion into horizontal carousel navigation
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = galleryRef.current;
    if (!container) return;

    // Trackpad horizontal swipe is native
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      return;
    }

    const maxScroll = container.scrollWidth - container.clientWidth;
    const isScrollingDown = e.deltaY > 0;
    const isScrollingUp = e.deltaY < 0;

    const canScroll =
      (isScrollingDown && container.scrollLeft < maxScroll - 6) ||
      (isScrollingUp && container.scrollLeft > 6);

    if (canScroll) {
      e.preventDefault();
      e.stopPropagation();
      container.scrollBy({
        left: e.deltaY * 1.3,
        behavior: 'smooth',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextHero();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevHero();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F1E9DC] text-[#292723] pt-16 md:pt-18 selection:bg-[#873A35] selection:text-[#FFF3DF] overflow-x-hidden animate-fade-in">
      
      {/* ================= SECTION 1: REDESIGNED FULL-VIEWPORT HERO & CAROUSEL ================= */}
      <section className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-3 lg:py-5 min-h-[calc(100svh-4rem)] md:min-h-[calc(100svh-4.5rem)] lg:h-[calc(100svh-4.5rem)] flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-14 items-center h-full my-auto">
          
          {/* Left Column: Heading, Architecture Story & Integrated Controls */}
          <div className="lg:col-span-6 flex flex-col justify-between py-2 sm:py-4 h-full max-h-[580px]">
            <div className="space-y-4 sm:space-y-6">
              
              {/* Kicker */}
              <div className="flex items-center gap-3 animate-fade-in">
                <span className="font-mono text-xs text-[#873A35] font-semibold tracking-widest">
                  01
                </span>
                <span className="h-[1px] w-12 bg-[#873A35]/35" aria-hidden="true" />
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#70452D] font-medium">
                  ARCHITECTURE &amp; LIGHT
                </span>
              </div>

              {/* Primary Headline */}
              <h1 className="font-editorial-sans text-3xl sm:text-4xl lg:text-[3.25rem] xl:text-[3.65rem] uppercase tracking-[0.04em] text-[#292723] leading-[1.08] font-normal">
                A SPACE<br />
                THAT FEELS<br />
                LIKE A PAUSE
              </h1>

              {/* Narrative Prose */}
              <div className="space-y-2 max-w-md">
                <p className="text-xs sm:text-sm md:text-base text-[#70452D] font-light leading-relaxed">
                  Good coffee, honest food and a space to slow down — right in the heart of Ahmedabad.
                </p>
                <p className="text-xs sm:text-sm text-[#70452D]/80 font-light leading-relaxed">
                  Handcrafted wooden pivot frames, terrazzo tables cast with local stone, and shaded breezeways designed to let the sun move gently across the room.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  onClick={onOpenBooking}
                  className="inline-flex items-center gap-2 bg-[#873A35] text-[#FFF3DF] text-xs font-semibold tracking-[0.16em] uppercase px-7 py-3 rounded-full hover:bg-[#70452D] active:scale-98 transition-all duration-300 shadow-xs cursor-pointer hover:scale-[1.02]"
                >
                  <span>Book a Table</span>
                  <span className="text-[10px]">✦</span>
                </button>

                <button
                  onClick={onNavigateToMenu}
                  className="inline-flex items-center gap-2 border border-[#70452D]/40 hover:border-[#873A35] bg-transparent hover:bg-[#DCCBB4]/40 text-[#292723] text-xs tracking-[0.15em] uppercase font-medium px-6 py-3 rounded-full transition-colors cursor-pointer"
                >
                  <span>View Menu</span>
                </button>
              </div>
            </div>

            {/* Slide Navigation Strip */}
            <div className="pt-4 sm:pt-6 border-t border-[#DCCBB4]/70 flex items-center justify-between max-w-md">
              <div className="space-y-0.5">
                <span className="font-mono text-xs text-[#70452D] tracking-widest tabular-nums font-semibold block">
                  {String(heroIndex + 1).padStart(2, '0')} / {String(heroPhotos.length).padStart(2, '0')} · {heroPhotos[heroIndex].caption}
                </span>
                <span className="text-[11px] font-mono text-[#70452D]/70 block truncate max-w-[240px]">
                  {heroPhotos[heroIndex].tag}
                </span>
              </div>

              {/* Optional Chevron Controls */}
              <div className="flex items-center gap-1.5 text-[#292723]">
                <button
                  onClick={prevHero}
                  className="p-2 border border-[#DCCBB4] hover:border-[#873A35] hover:text-[#873A35] hover:bg-[#DCCBB4]/25 rounded-full transition-all duration-200 cursor-pointer active:scale-95"
                  aria-label="Previous photograph"
                  title="Previous photo"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={nextHero}
                  className="p-2 border border-[#DCCBB4] hover:border-[#873A35] hover:text-[#873A35] hover:bg-[#DCCBB4]/25 rounded-full transition-all duration-200 cursor-pointer active:scale-95"
                  aria-label="Next photograph"
                  title="Next photo"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Natural Gesture-Driven Image Carousel (Mouse-Wheel, Trackpad, Swipe) */}
          <div className="lg:col-span-6 h-full flex flex-col items-center justify-center">
            <div
              ref={galleryRef}
              tabIndex={0}
              role="region"
              aria-roledescription="carousel"
              aria-label="MRDĀ Architecture and Courtyard Photography Carousel"
              onScroll={handleScroll}
              onWheel={handleWheel}
              onKeyDown={handleKeyDown}
              className="relative w-full max-w-[420px] lg:max-w-[460px] aspect-[4/5] max-h-[500px] xl:max-h-[520px] overflow-x-auto overflow-y-hidden rounded-xs bg-[#292723] shadow-xl flex snap-x snap-mandatory no-scrollbar select-none focus:outline-hidden focus:ring-1 focus:ring-[#873A35] scroll-smooth cursor-grab active:cursor-grabbing border border-[#DCCBB4]/50"
              style={{
                WebkitOverflowScrolling: 'touch',
                overscrollBehaviorX: 'contain',
              }}
            >
              {heroPhotos.map((photo, index) => (
                <div
                  key={index}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Photo ${index + 1} of ${heroPhotos.length}: ${photo.caption}`}
                  className="w-full h-full shrink-0 snap-center relative overflow-hidden group"
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover object-center pointer-events-none transition-transform duration-700 ease-out group-hover:scale-102"
                  />

                  {/* Atmospheric Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

                  {/* Top Caption Badge */}
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <span className="text-[10px] font-mono tracking-widest text-[#FFF3DF] bg-black/50 backdrop-blur-xs px-3 py-1 uppercase rounded-xs">
                      {photo.caption}
                    </span>
                  </div>

                  {/* Bottom Metadata Strip */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-[#FFF3DF]/90 pointer-events-none">
                    <span>The Claywalls · Thaltej</span>
                    <span className="text-right">{photo.tag.split('&')[0]}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Interaction Hint Strip */}
            <div className="mt-2.5 flex items-center justify-between w-full max-w-[420px] lg:max-w-[460px] text-[10px] font-mono text-[#70452D]/80 uppercase tracking-wider px-1">
              <span>{heroPhotos[heroIndex].caption}</span>
              <span className="hidden sm:inline text-[#70452D]/60">Swipe or scroll horizontally</span>
            </div>
          </div>

        </div>
      </section>

      {/* ================= SECTION 2: THE ATMOSPHERE FULL-VIEWPORT EDITORIAL SPREAD ================= */}
      <section className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-4 lg:py-6 min-h-[calc(100svh-4rem)] md:min-h-[calc(100svh-4.5rem)] lg:h-[calc(100svh-4.5rem)] flex flex-col justify-center border-t border-[#DCCBB4]/80">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4 sm:mb-6 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#873A35] font-semibold tracking-widest">
                02
              </span>
              <span className="h-[1px] w-12 bg-[#873A35]/35" aria-hidden="true" />
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#70452D] font-medium">
                THE ATMOSPHERE
              </span>
            </div>

            <h2 className="font-editorial-display text-2xl sm:text-3xl lg:text-4xl text-[#292723] font-medium tracking-tight">
              Natural Calm Everyday
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-[#70452D] font-light leading-relaxed max-w-md">
            Sunlight, textures, greenery and good company. A space designed for slow mornings, long conversations and everything in between.
          </p>
        </div>

        {/* 3-Pillar Architectural Spread tailored for Desktop 100svh Viewport */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6 items-stretch flex-1 my-auto max-h-[500px]">
          
          {/* Pillar 1: The Communal Table (Native 4:5 - cafe-8.jpg) */}
          <div className="md:col-span-4 flex flex-col justify-between space-y-2 h-full">
            <div className="relative aspect-[4/5] max-h-[420px] w-full rounded-xs overflow-hidden bg-[#DCCBB4]/30 shadow-md group">
              <img
                src="/MDRA/images/cafe/cafe-8.jpg"
                alt="Solid wood communal table under woven pendant domes at MRDĀ"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                onError={(e) => {
                  e.currentTarget.src = '/MDRA/images/cafe/cafe-1.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 text-[10px] font-mono tracking-widest text-[#FFF3DF] uppercase bg-black/40 px-2.5 py-1 rounded-xs backdrop-blur-xs">
                The Communal Table
              </div>
            </div>
            <div className="pt-1">
              <span className="font-editorial-display text-base sm:text-lg text-[#292723] font-medium block">
                The Communal Table
              </span>
              <span className="font-mono text-[11px] text-[#70452D]/80 uppercase tracking-wider block">
                Solid Wood &amp; Woven Pendant Domes
              </span>
            </div>
          </div>

          {/* Pillar 2: Center Feature (Ceramics & Foliage - cafe-5.jpg & cafe-9.jpg) */}
          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-3.5 h-full">
            <div className="relative aspect-[16/10] md:aspect-[16/9] max-h-[200px] w-full rounded-xs overflow-hidden bg-[#DCCBB4]/30 shadow-sm group">
              <img
                src="/MDRA/images/cafe/cafe-5.jpg"
                alt="Artisanal ceramics and cast terrazzo at MRDĀ"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-2 left-2 text-[10px] font-mono tracking-widest text-[#FFF3DF] uppercase bg-black/45 px-2 py-0.5 rounded-xs">
                Cast Terrazzo &amp; Clay
              </div>
            </div>

            <div className="relative aspect-[16/10] md:aspect-[16/9] max-h-[200px] w-full rounded-xs overflow-hidden bg-[#DCCBB4]/30 shadow-sm group">
              <img
                src="/MDRA/images/cafe/cafe-9.jpg"
                alt="Shadows through breeze blocks on textured plaster at MRDĀ"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-2 left-2 text-[10px] font-mono tracking-widest text-[#FFF3DF] uppercase bg-black/45 px-2 py-0.5 rounded-xs">
                Shadow &amp; Foliage
              </div>
            </div>
          </div>

          {/* Pillar 3: Window Nook (Native 4:5 - cafe-7.jpg) */}
          <div className="md:col-span-4 flex flex-col justify-between space-y-2 h-full">
            <div className="relative aspect-[4/5] max-h-[420px] w-full rounded-xs overflow-hidden bg-[#DCCBB4]/30 shadow-md group">
              <img
                src="/MDRA/images/cafe/cafe-7.jpg"
                alt="Quiet window alcove bathed in morning warmth at MRDĀ"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                onError={(e) => {
                  e.currentTarget.src = '/MDRA/images/cafe/cafe-6.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 text-[10px] font-mono tracking-widest text-[#FFF3DF] uppercase bg-black/40 px-2.5 py-1 rounded-xs backdrop-blur-xs">
                Window Alcove
              </div>
            </div>
            <div className="pt-1">
              <span className="font-editorial-display text-base sm:text-lg text-[#292723] font-medium block">
                The Window Alcove
              </span>
              <span className="font-mono text-[11px] text-[#70452D]/80 uppercase tracking-wider block">
                Quiet Mornings &amp; Natural Warmth
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ================= SECTION 3: COMPACT BRAND PHILOSOPHY (TERRACOTTA SPREAD) ================= */}
      <section className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-4 lg:py-6 min-h-[calc(100svh-4rem)] md:min-h-[calc(100svh-4.5rem)] lg:h-[calc(100svh-4.5rem)] flex flex-col justify-center border-t border-[#DCCBB4]/80">
        <div className="bg-[#873A35] text-[#FFF3DF] rounded-xs p-6 sm:p-8 lg:p-10 xl:p-12 shadow-lg overflow-hidden my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-[#FFF3DF]/80 font-semibold tracking-widest">
                  03
                </span>
                <span className="h-[1px] w-12 bg-[#FFF3DF]/40" aria-hidden="true" />
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#FFF3DF]/90 font-medium">
                  OUR PHILOSOPHY
                </span>
              </div>

              <h2 className="font-editorial-display text-3xl sm:text-4xl lg:text-5xl text-[#FFF3DF] font-medium tracking-tight leading-[1.08]">
                More Than<br />a Café
              </h2>

              <p className="text-xs sm:text-sm md:text-base text-[#FFF3DF]/90 font-light leading-relaxed max-w-lg">
                Mrda is built on a simple idea — good coffee, thoughtful food and a welcoming space for people to slow down. It's a place for conversations, creativity and the little moments that make everyday life richer.
              </p>

              <div>
                <button
                  onClick={onOpenBooking}
                  className="inline-flex items-center gap-2 bg-[#FFF3DF] text-[#873A35] hover:bg-[#F1E9DC] text-xs font-semibold tracking-[0.16em] uppercase px-7 py-3 rounded-full transition-all duration-300 shadow-xs cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Our Space, Our People</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Right Photograph in Natural 4:5 Portrait Frame */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[340px] lg:max-w-[380px] aspect-[4/5] rounded-xs overflow-hidden shadow-md bg-[#70452D] group border border-[#FFF3DF]/20">
                <img
                  src="/MDRA/featured/ref_more_left.jpg"
                  alt="Outdoor terrazzo table with wooden chairs and potted tree in warm sun"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = '/MDRA/images/cafe/cafe-7.jpg';
                  }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= SECTION 4: DETAILS THAT MATTER ================= */}
      <section id="details" className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 pt-8 sm:pt-10 md:pt-12 pb-12 sm:pb-16 border-t border-[#DCCBB4]/80">
        
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="font-mono text-xs text-[#873A35] font-semibold tracking-widest">
            04
          </span>
          <span className="h-[1px] w-12 sm:w-20 bg-[#873A35]/35" aria-hidden="true" />
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#70452D] font-medium">
            DETAILS THAT MATTER
          </span>
        </div>

        {/* 4 Feature Columns in Native Landscape Aspect Ratio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7 mt-6 sm:mt-8">
          
          {/* Feature 1: Curated Seating */}
          <div className="group space-y-2.5">
            <div className="aspect-[16/10] sm:aspect-[3/2] overflow-hidden rounded-xs bg-[#DCCBB4]/30 shadow-2xs">
              <img
                src="/MDRA/images/cafe/cafe-7.jpg"
                alt="Curated Seating at MRDĀ"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = '/MDRA/images/cafe/cafe-8.jpg';
                }}
              />
            </div>
            <div>
              <h3 className="font-mono text-xs sm:text-[13px] uppercase tracking-[0.18em] text-[#292723] font-semibold">
                CURATED SEATING
              </h3>
              <p className="text-xs text-[#70452D] font-light leading-relaxed mt-1">
                Spots for every mood — quiet corners or shared tables.
              </p>
            </div>
          </div>

          {/* Feature 2: Natural Light */}
          <div className="group space-y-2.5">
            <div className="aspect-[16/10] sm:aspect-[3/2] overflow-hidden rounded-xs bg-[#DCCBB4]/30 shadow-2xs">
              <img
                src="/MDRA/images/cafe/cafe-1.jpg"
                alt="Natural light through wooden pivot frames at MRDĀ"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = '/MDRA/images/cafe/cafe-2.jpg';
                }}
              />
            </div>
            <div>
              <h3 className="font-mono text-xs sm:text-[13px] uppercase tracking-[0.18em] text-[#292723] font-semibold">
                NATURAL LIGHT
              </h3>
              <p className="text-xs text-[#70452D] font-light leading-relaxed mt-1">
                Spaces that change beautifully through the day.
              </p>
            </div>
          </div>

          {/* Feature 3: Materials */}
          <div className="group space-y-2.5">
            <div className="aspect-[16/10] sm:aspect-[3/2] overflow-hidden rounded-xs bg-[#DCCBB4]/30 shadow-2xs">
              <img
                src="/MDRA/images/cafe/cafe-5.jpg"
                alt="Honest materials and handmade ceramics at MRDĀ"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = '/MDRA/images/cafe/cafe-9.jpg';
                }}
              />
            </div>
            <div>
              <h3 className="font-mono text-xs sm:text-[13px] uppercase tracking-[0.18em] text-[#292723] font-semibold">
                MATERIALS
              </h3>
              <p className="text-xs text-[#70452D] font-light leading-relaxed mt-1">
                Honest materials, warm textures and timeless design.
              </p>
            </div>
          </div>

          {/* Feature 4: A Welcoming Atmosphere */}
          <div className="group space-y-2.5">
            <div className="aspect-[16/10] sm:aspect-[3/2] overflow-hidden rounded-xs bg-[#DCCBB4]/30 shadow-2xs">
              <img
                src="/MDRA/images/cafe/cafe-9.jpg"
                alt="Greenery and welcoming atmosphere at MRDĀ"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = '/MDRA/images/cafe/cafe-6.jpg';
                }}
              />
            </div>
            <div>
              <h3 className="font-mono text-xs sm:text-[13px] uppercase tracking-[0.18em] text-[#292723] font-semibold">
                A WELCOMING ATMOSPHERE
              </h3>
              <p className="text-xs text-[#70452D] font-light leading-relaxed mt-1">
                Good coffee, good food, better company.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ================= COHESIVE FOOTER FOR THE SPACE ================= */}
      <Footer
        onNavigateHome={onNavigateHome}
        onNavigateToMenu={onNavigateToMenu}
        onNavigateToEvents={onNavigateToEvents}
      />

    </div>
  );
};
