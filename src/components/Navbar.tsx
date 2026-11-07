import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  activeView: 'home' | 'menu' | 'space' | 'events';
  onNavigateHome: (sectionId?: string) => void;
  onNavigateToMenu: (tab?: 'poured' | 'plated') => void;
  onNavigateToSpace: () => void;
  onNavigateToEvents: () => void;
  onOpenBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigateHome,
  onNavigateToMenu,
  onNavigateToSpace,
  onNavigateToEvents,
  onOpenBooking,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Exact required links: Home | Menu | The Space | Events
  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'menu', label: 'Menu' },
    { id: 'space', label: 'The Space' },
    { id: 'events', label: 'Events' },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    if (id === 'home') {
      onNavigateHome('hero');
    } else if (id === 'menu') {
      onNavigateToMenu('poured');
    } else if (id === 'space') {
      onNavigateToSpace();
    } else if (id === 'events') {
      onNavigateToEvents();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#F1E9DC]/90 backdrop-blur-md border-b border-[#DCCBB4]/50 transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-16 md:h-18 flex items-center justify-between">
        
        {/* Brand Zone - Exact MRDĀ Logo with Starburst */}
        <button
          onClick={() => handleNavClick('home')}
          className="group flex flex-col items-center justify-center tracking-[0.2em] font-editorial-sans text-[#292723] hover:text-[#873A35] transition-colors shrink-0 cursor-pointer text-left"
          aria-label="MRDĀ Café Homepage"
        >
          <span className="text-xl md:text-2xl font-bold uppercase tracking-[0.18em]">
            MRDĀ
          </span>
          <span className="text-[10px] md:text-xs -mt-1 text-[#873A35] group-hover:scale-125 transition-transform" aria-hidden="true">
            ✦
          </span>
        </button>

        {/* Desktop Navigation Links with Active Indicator */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-10 text-xs lg:text-sm tracking-wider uppercase font-medium text-[#70452D]">
          {navLinks.map((link) => {
            const isActive = activeView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`py-1 relative transition-colors cursor-pointer ${
                  isActive ? 'text-[#873A35] font-semibold' : 'hover:text-[#873A35]'
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#873A35] animate-fade-in" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Button - Brick Red Pill Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenBooking}
            className="bg-[#873A35] text-[#FFF3DF] text-xs md:text-sm font-medium tracking-wider uppercase px-5 md:px-7 py-2.5 rounded-full hover:bg-[#70452D] hover:scale-[1.02] active:scale-95 transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
          >
            Book a Table
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#292723] hover:text-[#873A35] transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F1E9DC] border-b border-[#DCCBB4] px-6 py-6 shadow-lg transition-all animate-fade-in">
          <nav className="flex flex-col gap-4 text-sm font-medium uppercase tracking-wider text-[#70452D]">
            {navLinks.map((link) => {
              const isActive = activeView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`text-left py-2 border-b border-[#DCCBB4]/40 flex items-center justify-between ${
                    isActive ? 'text-[#873A35] font-semibold' : 'hover:text-[#873A35]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="text-[#873A35] text-xs">✦ Active</span>}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
