import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CalendarCheck2,
  Clock,
  UtensilsCrossed,
  Sparkles,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { AdminUser, adminApi } from '../../services/adminApi';

export type AdminTab =
  | 'dashboard'
  | 'reservations'
  | 'availability'
  | 'menu'
  | 'events'
  | 'settings';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  currentUser: AdminUser;
  onLogout: () => void;
  onReturnToSite: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onLogout,
  onReturnToSite,
  children,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setMobileDrawerOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileDrawerOpen]);

  const navItems: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'reservations', label: 'Reservations', icon: CalendarCheck2 },
    { id: 'availability', label: 'Availability & Slots', icon: Clock },
    { id: 'menu', label: 'Menu & Stock', icon: UtensilsCrossed },
    { id: 'events', label: 'Events & Lineups', icon: Sparkles },
    { id: 'settings', label: 'Console Settings', icon: Settings },
  ];

  const handleTabClick = (tab: AdminTab) => {
    onSelectTab(tab);
    setMobileDrawerOpen(false);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    await adminApi.logout();
    onLogout();
  };

  return (
    <div className="min-h-screen w-full bg-[#F1E9DC] text-[#292723] font-editorial-sans flex flex-col lg:flex-row selection:bg-[#873A35] selection:text-[#FFF3DF]">
      
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden lg:flex w-64 xl:w-72 flex-col justify-between bg-[#FFF3DF] border-r border-[#DCCBB4] fixed inset-y-0 left-0 z-30 shadow-xs">
        
        {/* Brand & Console Title */}
        <div>
          <div className="p-6 border-b border-[#DCCBB4]/70">
            <div className="flex items-center gap-2 tracking-[0.2em] font-editorial-sans text-[#292723]">
              <span className="text-2xl font-bold uppercase tracking-[0.18em]">MRDĀ</span>
              <span className="text-xs text-[#873A35]">✦</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px] font-mono tracking-widest text-[#70452D] uppercase">
              <span>HOSPITALITY CONSOLE</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xs text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#873A35] text-[#FFF3DF] font-semibold shadow-xs'
                      : 'text-[#70452D] hover:bg-[#DCCBB4]/40 hover:text-[#292723]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? 'text-[#FFF3DF]' : 'text-[#873A35]'} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="opacity-80" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Zone: Profile & Actions */}
        <div className="p-4 border-t border-[#DCCBB4]/70 space-y-3 bg-[#F1E9DC]/40">
          
          {/* User profile card */}
          <div className="px-3 py-2 bg-white/70 border border-[#DCCBB4]/60 rounded-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#873A35] text-[#FFF3DF] flex items-center justify-center text-xs font-bold font-mono">
                {currentUser.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <span className="block text-xs font-semibold text-[#292723] truncate">
                  {currentUser.name}
                </span>
                <span className="block text-[10px] font-mono text-[#70452D]/80 truncate">
                  {currentUser.email}
                </span>
              </div>
            </div>
          </div>

          {/* Public site link */}
          <button
            onClick={onReturnToSite}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xs border border-[#DCCBB4] text-xs font-mono uppercase tracking-wider text-[#70452D] hover:bg-white hover:text-[#292723] transition-colors cursor-pointer"
          >
            <ExternalLink size={13} />
            <span>Public Website</span>
          </button>

          {/* Logout button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xs bg-[#873A35]/10 hover:bg-[#873A35]/20 text-[#873A35] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* ================= MOBILE HEADER ================= */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#FFF3DF] border-b border-[#DCCBB4] px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold uppercase tracking-[0.16em]">MRDĀ</span>
          <span className="text-xs text-[#873A35]">✦</span>
          <span className="text-xs font-mono uppercase tracking-wider text-[#70452D] ml-2">Console</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReturnToSite}
            className="p-1.5 text-[#70452D] hover:text-[#873A35] rounded cursor-pointer"
            title="Public Website"
          >
            <ExternalLink size={18} />
          </button>
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="p-1.5 text-[#292723] hover:text-[#873A35] rounded cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileDrawerOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ================= MOBILE SLIDE-OVER DRAWER WITH BACKDROP ================= */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#FFF3DF] border-r border-[#DCCBB4] flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            <div>
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#DCCBB4]/70 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 tracking-[0.2em] font-editorial-sans text-[#292723]">
                    <span className="text-xl font-bold uppercase tracking-[0.18em]">MRDĀ</span>
                    <span className="text-xs text-[#873A35]">✦</span>
                  </div>
                  <div className="text-[10px] font-mono tracking-widest text-[#70452D] uppercase mt-0.5">
                    HOSPITALITY CONSOLE
                  </div>
                </div>

                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#70452D] hover:text-[#873A35] rounded-full hover:bg-[#DCCBB4]/30 cursor-pointer transition-colors"
                  aria-label="Close navigation drawer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Items (Touch target >= 44px) */}
              <nav className="p-3 space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full min-h-[44px] flex items-center justify-between px-4 py-3 rounded-xs text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#873A35] text-[#FFF3DF] font-semibold shadow-xs'
                          : 'text-[#70452D] hover:bg-[#DCCBB4]/40 hover:text-[#292723]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={isActive ? 'text-[#FFF3DF]' : 'text-[#873A35]'} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight size={14} className="opacity-80" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#DCCBB4]/70 space-y-3 bg-[#F1E9DC]/40">
              <div className="px-3 py-2 bg-white/70 border border-[#DCCBB4]/60 rounded-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#873A35] text-[#FFF3DF] flex items-center justify-center text-xs font-bold font-mono">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <span className="block text-xs font-semibold text-[#292723] truncate">
                      {currentUser.name}
                    </span>
                    <span className="block text-[10px] font-mono text-[#70452D]/80 truncate">
                      {currentUser.email}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onReturnToSite();
                }}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xs border border-[#DCCBB4] text-xs font-mono uppercase tracking-wider text-[#70452D] hover:bg-white hover:text-[#292723] transition-colors cursor-pointer"
              >
                <ExternalLink size={14} />
                <span>Public Website</span>
              </button>

              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xs bg-[#873A35]/10 hover:bg-[#873A35]/20 text-[#873A35] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <main className="flex-1 lg:ml-64 xl:ml-72 min-h-screen flex flex-col overflow-x-hidden">
        
        {/* Top Header Bar for Desktop */}
        <div className="hidden lg:flex items-center justify-between px-8 py-4 bg-[#F1E9DC]/80 backdrop-blur-xs border-b border-[#DCCBB4]/70 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs font-mono text-[#70452D] uppercase tracking-wider">
            <span>MRDĀ Console</span>
            <span>/</span>
            <span className="text-[#873A35] font-semibold">{navItems.find((n) => n.id === currentTab)?.label}</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-[#70452D]">
            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Online · Server Connected</span>
            </div>
            <span>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Dynamic Tab Content */}
        <div key={currentTab} className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </div>

      </main>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-editorial-sans text-xl font-medium text-[#292723]">
              Confirm Sign Out
            </h3>
            <p className="text-xs text-[#70452D] leading-relaxed">
              Are you sure you want to exit the MRDĀ administrative console? Your session token will be revoked on the server.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#70452D] hover:text-[#292723] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-5 py-2 text-xs font-mono uppercase tracking-wider bg-[#873A35] text-[#FFF3DF] hover:bg-[#70452D] rounded-full transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
