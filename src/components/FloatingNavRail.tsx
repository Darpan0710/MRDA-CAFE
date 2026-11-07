import React from 'react';

interface FloatingNavRailProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const FloatingNavRail: React.FC<FloatingNavRailProps> = ({
  activeSection,
  onNavigate,
}) => {
  const sections = [
    { id: 'hero', num: '01', label: 'Hero' },
    { id: 'menu', num: '02', label: 'Menu (Poured & Plated)' },
    { id: 'space', num: '03', label: 'The Space' },
    { id: 'events', num: '04', label: 'Events' },
    { id: 'visit', num: '05', label: 'Visit Us' },
  ];

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden xl:flex flex-col items-center gap-4 pointer-events-auto">
      {sections.map((sec) => {
        const isActive = activeSection === sec.id;
        return (
          <button
            key={sec.id}
            onClick={() => onNavigate(sec.id)}
            className="group relative flex items-center justify-center p-1.5 cursor-pointer"
            aria-label={`Jump to ${sec.label}`}
          >
            {/* Tooltip on hover */}
            <span className="absolute right-8 px-2.5 py-1 text-[11px] font-mono tracking-wider uppercase bg-[#292723] text-[#FFF3DF] rounded-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {sec.num} · {sec.label}
            </span>

            {/* Indicator pill/dash */}
            <div
              className={`transition-all duration-300 rounded-full ${
                isActive
                  ? 'w-7 h-1.5 bg-[#873A35]'
                  : 'w-2 h-1.5 bg-[#70452D]/30 group-hover:bg-[#873A35]/60 group-hover:w-4'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
