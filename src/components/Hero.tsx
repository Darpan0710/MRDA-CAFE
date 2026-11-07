import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { HERO_SLIDES } from '../data/cafeData';

interface HeroProps {
  onExploreSpace: () => void;
  onOpenBooking: () => void;
  isActive: boolean;
}

export const Hero: React.FC<HeroProps> = ({ onExploreSpace, onOpenBooking, isActive }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // Smooth programmatic scroll to a specific slide index
  const scrollToSlide = (index: number) => {
    const container = galleryRef.current;
    if (!container) return;
    const slideWidth = container.clientWidth;
    isScrollingRef.current = true;
    container.scrollTo({
      left: index * slideWidth,
      behavior: 'smooth',
    });
    setCurrentSlideIndex(index);
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 450);
  };

  const handlePrev = () => {
    const target = currentSlideIndex === 0 ? HERO_SLIDES.length - 1 : currentSlideIndex - 1;
    scrollToSlide(target);
  };

  const handleNext = () => {
    const target = currentSlideIndex === HERO_SLIDES.length - 1 ? 0 : currentSlideIndex + 1;
    scrollToSlide(target);
  };

  // Keep active index synchronized when user scrolls naturally via touch, trackpad, or mousewheel
  const handleScroll = () => {
    if (isScrollingRef.current) return;
    const container = galleryRef.current;
    if (!container) return;
    const slideWidth = container.clientWidth;
    if (slideWidth > 0) {
      const index = Math.round(container.scrollLeft / slideWidth);
      const clamped = Math.max(0, Math.min(HERO_SLIDES.length - 1, index));
      if (clamped !== currentSlideIndex) {
        setCurrentSlideIndex(clamped);
      }
    }
  };

  // Convert vertical mouse wheel over gallery into horizontal scroll, without hijacking the rest of the site
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = galleryRef.current;
    if (!container) return;

    // If it's already a horizontal trackpad gesture, let browser handle natively
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      return;
    }

    const maxScroll = container.scrollWidth - container.clientWidth;
    const isScrollingDown = e.deltaY > 0;
    const isScrollingUp = e.deltaY < 0;

    // Check if gallery has room to scroll in this direction
    const canScroll =
      (isScrollingDown && container.scrollLeft < maxScroll - 6) ||
      (isScrollingUp && container.scrollLeft > 6);

    if (canScroll) {
      // Prevent parent page snap from jumping while user browses the gallery images
      e.preventDefault();
      e.stopPropagation();

      container.scrollBy({
        left: e.deltaY * 1.3,
        behavior: 'smooth',
      });
    }
    // When reached the end, native page scroll takes over naturally
  };

  // Keyboard navigation when gallery is focused
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    }
  };

  const activeSlide = HERO_SLIDES[currentSlideIndex];

  return (
    <section
      id="hero"
      className="snap-full-section justify-between pt-20 md:pt-24 pb-6 md:pb-8 px-6 md:px-12 bg-[#F1E9DC]"
    >
      <div className="max-w-[1400px] w-full mx-auto flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center h-full">
          
          {/* Left Column: Stable, High-Performance Editorial Presentation */}
          <div className="lg:col-span-6 flex flex-col justify-between py-2 sm:py-4 h-full max-h-[580px]">
            <div className="space-y-6">
              {/* Primary Headline - 60fps stable render */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-[3.8rem] leading-[1.08] tracking-[0.02em] font-editorial-sans text-[#292723] uppercase font-normal">
                A QUIET<br />
                PLACE FOR<br />
                GOOD COMPANY
              </h1>

              {/* Subtext */}
              <p className="text-[#70452D] text-xs sm:text-sm md:text-base leading-relaxed max-w-md font-light">
                Good coffee, honest food and a space to slow down — right in the heart of Ahmedabad.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={onOpenBooking}
                  className="group inline-flex items-center gap-2 bg-[#873A35] hover:bg-[#70452D] text-[#FFF3DF] text-xs md:text-sm tracking-[0.15em] uppercase font-medium px-7 py-3 rounded-full transition-colors duration-200 cursor-pointer shadow-xs"
                >
                  <span>Book a Table</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={onExploreSpace}
                  className="group inline-flex items-center gap-2 border border-[#70452D]/40 hover:border-[#873A35] bg-transparent hover:bg-[#DCCBB4]/40 text-[#292723] text-xs md:text-sm tracking-[0.15em] uppercase font-medium px-5 py-3 rounded-full transition-colors duration-200 cursor-pointer"
                >
                  <span>The Space</span>
                  <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </div>

            {/* Slide Pagination & Navigation Controls (Minimal & Uncluttered: Counter on left, Controls on right) */}
            <div className="pt-6 sm:pt-8 flex items-center justify-between border-t border-[#DCCBB4]/60 max-w-md">
              <span className="font-mono text-xs text-[#70452D] tracking-widest tabular-nums font-medium">
                {String(currentSlideIndex + 1).padStart(2, '0')} / {String(HERO_SLIDES.length).padStart(2, '0')}
              </span>

              {/* Slide Navigation Buttons (Optional Controls) */}
              <div className="flex items-center gap-1.5 text-[#292723]">
                <button
                  onClick={handlePrev}
                  className="p-2 border border-[#DCCBB4] hover:border-[#873A35] hover:text-[#873A35] hover:bg-[#DCCBB4]/25 rounded-full transition-all duration-200 cursor-pointer active:scale-95"
                  aria-label="Previous Café View"
                  title="Previous image"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 border border-[#DCCBB4] hover:border-[#873A35] hover:text-[#873A35] hover:bg-[#DCCBB4]/25 rounded-full transition-all duration-200 cursor-pointer active:scale-95"
                  aria-label="Next Café View"
                  title="Next image"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Naturally Scrollable 3-Image Gallery (Touch, Trackpad & Mouse Wheel) */}
          <div className="lg:col-span-6 h-full flex flex-col items-center justify-center">
            <div
              ref={galleryRef}
              tabIndex={0}
              role="region"
              aria-roledescription="carousel"
              aria-label="MRDĀ Café Architecture & Courtyard Gallery"
              onScroll={handleScroll}
              onWheel={handleWheel}
              onKeyDown={handleKeyDown}
              className="relative w-full max-w-[420px] lg:max-w-[460px] aspect-[4/5] max-h-[520px] overflow-x-auto overflow-y-hidden rounded-xs bg-[#292723] shadow-lg flex snap-x snap-mandatory no-scrollbar select-none focus:outline-hidden focus:ring-1 focus:ring-[#873A35] scroll-smooth cursor-grab active:cursor-grabbing border border-[#DCCBB4]/50"
              style={{
                WebkitOverflowScrolling: 'touch',
                overscrollBehaviorX: 'contain',
              }}
            >
              {HERO_SLIDES.map((slideItem, index) => (
                <div
                  key={slideItem.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Slide ${index + 1} of ${HERO_SLIDES.length}: ${slideItem.title}`}
                  className="w-full h-full shrink-0 snap-center relative overflow-hidden group"
                >
                  <img
                    src={slideItem.image}
                    alt={`MRDĀ café in Ahmedabad - ${slideItem.title}`}
                    className="w-full h-full object-cover object-center pointer-events-none transition-transform duration-700 ease-out group-hover:scale-102"
                    onError={(e) => {
                      e.currentTarget.src = slideItem.fallback;
                    }}
                  />
                  
                  {/* Subtle Gradient for Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Top Caption Badge */}
                  <div className="absolute top-4 right-4 pointer-events-none">
                    <span className="text-[10px] sm:text-xs font-mono tracking-widest text-[#FFF3DF] bg-black/45 backdrop-blur-xs px-3 py-1 uppercase rounded-xs">
                      {slideItem.caption}
                    </span>
                  </div>

                  {/* Bottom Title & Description Badge */}
                  <div className="absolute bottom-4 left-4 right-4 pointer-events-none flex items-end justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="block text-[10px] font-mono uppercase tracking-widest text-[#FFF3DF]/80">
                        {slideItem.title}
                      </span>
                      <p className="text-[11px] sm:text-xs font-mono text-[#FFF3DF] bg-black/55 backdrop-blur-xs px-2.5 py-1 rounded-xs inline-block">
                        {slideItem.description}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-[#FFF3DF]/80 bg-black/55 backdrop-blur-xs px-2 py-1 rounded-xs uppercase tracking-wider shrink-0">
                      {index + 1} / {HERO_SLIDES.length}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtle Gallery Interaction Hint */}
            <div className="mt-2.5 flex items-center justify-between w-full max-w-[420px] lg:max-w-[460px] text-[10px] font-mono text-[#70452D]/80 uppercase tracking-wider px-1">
              <span>{activeSlide.title}</span>
              <span className="hidden sm:inline text-[#70452D]/60">Swipe or scroll horizontally</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
