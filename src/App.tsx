/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CombinedMenu } from './components/CombinedMenu';
import { TheSpace } from './components/TheSpace';
import { UpcomingEventsSection } from './components/UpcomingEventsSection';
import { VisitUs } from './components/VisitUs';
import { FloatingNavRail } from './components/FloatingNavRail';
import { MenuPage } from './components/MenuPage';
import { TheSpacePage } from './components/TheSpacePage';
import { EventsPage } from './components/EventsPage';
import { ReservationModal } from './components/ReservationModal';
import { DirectionsModal } from './components/DirectionsModal';
import { AdminArea } from './components/admin/AdminArea';

export default function App() {
  // Navigation & View States initialized synchronously from URL to prevent flash of homepage
  const [currentView, setCurrentView] = useState<'home' | 'menu' | 'space' | 'events' | 'admin'>(() => {
    if (typeof window === 'undefined') return 'home';
    const p = window.location.pathname;
    const h = window.location.hash;
    const s = window.location.search;
    if (p === '/admin' || p.startsWith('/admin') || h === '#admin' || s.includes('admin')) return 'admin';
    if (p === '/events' || p.startsWith('/events') || h === '#events' || s.includes('events')) return 'events';
    if (p === '/space' || p.startsWith('/space') || h === '#space' || s.includes('space')) return 'space';
    if (p === '/menu' || p.startsWith('/menu') || h.includes('poured') || h.includes('plated') || h === '#menu' || s.includes('poured') || s.includes('plated')) return 'menu';
    return 'home';
  });
  const [menuActiveTab, setMenuActiveTab] = useState<'poured' | 'plated'>(() => {
    if (typeof window === 'undefined') return 'poured';
    const p = window.location.pathname;
    const h = window.location.hash;
    const s = window.location.search;
    if (p.includes('/plated') || h === '#plated' || s.includes('plated')) return 'plated';
    return 'poured';
  });
  const [adminTab, setAdminTab] = useState<'dashboard' | 'reservations' | 'availability' | 'menu' | 'events' | 'settings'>('dashboard');
  const [activeSection, setActiveSection] = useState<string>('hero');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Modals for deep engagement
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [directionsModalOpen, setDirectionsModalOpen] = useState(false);

  // URL-based routing & browser history (popstate) support
  useEffect(() => {
    const handleUrlChange = () => {
      if (typeof window === 'undefined') return;
      const pathname = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;

      if (
        pathname === '/admin' ||
        pathname.startsWith('/admin/') ||
        search.includes('admin') ||
        hash === '#admin'
      ) {
        setCurrentView('admin');
        if (pathname.includes('/reservations')) setAdminTab('reservations');
        else if (pathname.includes('/availability')) setAdminTab('availability');
        else if (pathname.includes('/menu')) setAdminTab('menu');
        else if (pathname.includes('/events')) setAdminTab('events');
        else if (pathname.includes('/settings')) setAdminTab('settings');
        else setAdminTab('dashboard');
      } else if (pathname === '/events' || pathname.startsWith('/events') || search.includes('events') || hash === '#events') {
        setCurrentView('events');
      } else if (pathname === '/space' || pathname.startsWith('/space') || search.includes('space') || hash === '#space') {
        setCurrentView('space');
      } else if (
        pathname === '/menu' ||
        pathname.startsWith('/menu') ||
        search.includes('poured') ||
        search.includes('plated') ||
        hash === '#menu' ||
        hash === '#poured' ||
        hash === '#plated'
      ) {
        setCurrentView('menu');
        if (pathname.includes('/plated') || search.includes('plated') || hash === '#plated') {
          setMenuActiveTab('plated');
        } else {
          setMenuActiveTab('poured');
        }
      } else {
        setCurrentView('home');
        if (hash) {
          const sectionId = hash.replace('#', '');
          setTimeout(() => scrollToSection(sectionId), 80);
        }
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // IntersectionObserver to observe homepage sections for active state
  useEffect(() => {
    if (currentView !== 'home') return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const sections = container.querySelectorAll('section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: container,
        threshold: [0.2, 0.45, 0.75],
      }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, [currentView]);

  // Smooth Section Navigation Helper respecting user reduced-motion preferences
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      element.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
      setActiveSection(id);
    }
  };

  // Navigation helpers with seamless pushState
  const navigateToHome = (sectionId: string = 'hero') => {
    if (currentView !== 'home') {
      setCurrentView('home');
      const targetUrl = sectionId === 'hero' ? '/' : `/#${sectionId}`;
      window.history.pushState({ view: 'home', sectionId }, '', targetUrl);
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 50);
    } else {
      scrollToSection(sectionId);
      if (window.location.hash !== `#${sectionId}`) {
        window.history.pushState(null, '', sectionId === 'hero' ? '/' : `/#${sectionId}`);
      }
    }
  };

  const navigateToMenu = (tab: 'poured' | 'plated' = 'poured') => {
    setCurrentView('menu');
    setMenuActiveTab(tab);
    window.history.pushState({ view: 'menu', tab }, '', `/menu/${tab}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSpace = () => {
    setCurrentView('space');
    window.history.pushState({ view: 'space' }, '', '/space');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToEvents = () => {
    setCurrentView('events');
    window.history.pushState({ view: 'events' }, '', '/events');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdmin = () => {
    setCurrentView('admin');
    window.history.pushState({ view: 'admin' }, '', '/admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard navigation on Homepage
  useEffect(() => {
    if (currentView !== 'home') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (bookingModalOpen || directionsModalOpen) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      const sectionIds = ['hero', 'menu', 'space', 'events', 'visit'];
      const currentIndex = sectionIds.indexOf(activeSection);

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (currentIndex < sectionIds.length - 1) {
          e.preventDefault();
          scrollToSection(sectionIds[currentIndex + 1]);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (currentIndex > 0) {
          e.preventDefault();
          scrollToSection(sectionIds[currentIndex - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, activeSection, bookingModalOpen, directionsModalOpen]);

  return (
    <div
      className={`relative w-full max-w-full overflow-x-hidden bg-[#F1E9DC] text-[#292723] font-editorial-sans selection:bg-[#873A35] selection:text-[#FFF3DF] ${
        currentView === 'home' ? 'h-[100svh] overflow-hidden' : 'min-h-screen overflow-y-auto'
      }`}
    >
      {/* Global Fixed Navbar: Exactly MRDĀ logo | Home | Menu | The Space | Events | Book a Table */}
      {currentView !== 'admin' && (
        <Navbar
          activeView={currentView}
          onNavigateHome={navigateToHome}
          onNavigateToMenu={navigateToMenu}
          onNavigateToSpace={navigateToSpace}
          onNavigateToEvents={navigateToEvents}
          onOpenBooking={() => setBookingModalOpen(true)}
        />
      )}

      {/* VIEW 1: HOMEPAGE */}
      {currentView === 'home' && (
        <>
          {/* Floating Vertical Navigation Rail (Desktop Homepage) */}
          <FloatingNavRail
            activeSection={activeSection}
            onNavigate={scrollToSection}
          />

          {/* Main Snap Scroll Container */}
          <main
            id="snap-main"
            ref={scrollContainerRef}
            className="snap-scroll-container w-full h-full"
          >
            {/* 1. HERO — The main introduction to MRDĀ */}
            <Hero
              onExploreSpace={navigateToSpace}
              onOpenBooking={() => setBookingModalOpen(true)}
              isActive={activeSection === 'hero'}
            />

            {/* 2. MENU — Plated and Poured together in ONE section */}
            <CombinedMenu
              onOpenBeverages={() => navigateToMenu('poured')}
              onOpenFood={() => navigateToMenu('plated')}
              isActive={activeSection === 'menu'}
            />

            {/* 3. THE SPACE — Café interiors & atmosphere */}
            <TheSpace
              onNavigateToSpace={navigateToSpace}
              isActive={activeSection === 'space'}
            />

            {/* 4. UPCOMING EVENTS — Dynamic upcoming events section */}
            <UpcomingEventsSection
              onNavigateToEvents={navigateToEvents}
              onNavigateToSpace={navigateToSpace}
              onOpenBooking={() => setBookingModalOpen(true)}
              isActive={activeSection === 'events'}
            />

            {/* 5. VISIT US — Location, contact, and reservation call to action */}
            <VisitUs
              onOpenDirections={() => setDirectionsModalOpen(true)}
              onOpenBooking={() => setBookingModalOpen(true)}
              onOpenMenu={() => navigateToMenu('poured')}
              onNavigateToSpace={navigateToSpace}
              onNavigateToAdmin={navigateToAdmin}
              isActive={activeSection === 'visit'}
            />
          </main>
        </>
      )}

      {/* VIEW 2: UNIFIED MENU PAGE */}
      {currentView === 'menu' && (
        <MenuPage
          initialTab={menuActiveTab}
          onNavigateHome={navigateToHome}
          onOpenBooking={() => setBookingModalOpen(true)}
          onNavigateToSpace={navigateToSpace}
          onNavigateToEvents={navigateToEvents}
        />
      )}

      {/* VIEW 3: THE SPACE PAGE */}
      {currentView === 'space' && (
        <TheSpacePage
          onNavigateHome={navigateToHome}
          onOpenBooking={() => setBookingModalOpen(true)}
          onNavigateToMenu={() => navigateToMenu('poured')}
          onNavigateToEvents={navigateToEvents}
        />
      )}

      {/* VIEW 4: EVENTS PAGE */}
      {currentView === 'events' && (
        <EventsPage
          onNavigateHome={navigateToHome}
          onOpenBooking={() => setBookingModalOpen(true)}
          onNavigateToMenu={() => navigateToMenu('poured')}
          onNavigateToSpace={navigateToSpace}
        />
      )}

      {/* VIEW 5: ADMIN AREA */}
      {currentView === 'admin' && (
        <AdminArea
          initialTab={adminTab}
          onReturnToSite={() => navigateToHome('hero')}
        />
      )}

      {/* Reservation & Directions Modals */}
      <ReservationModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />

      <DirectionsModal
        isOpen={directionsModalOpen}
        onClose={() => setDirectionsModalOpen(false)}
        onOpenBooking={() => setBookingModalOpen(true)}
      />
    </div>
  );
}
