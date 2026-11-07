import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  Calendar,
  Clock,
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Plus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  MapPin,
  ShieldAlert,
} from 'lucide-react';
import {
  adminApi,
  DashboardMetrics,
  Reservation,
  BlockedSlot,
  MenuItem,
  EventItem,
} from '../../services/adminApi';
import { AdminTab } from './AdminLayout';

interface AdminDashboardProps {
  onNavigateTab: (tab: AdminTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [blockedSlotsPreview, setBlockedSlotsPreview] = useState<BlockedSlot[]>([]);
  const [outOfStockPreview, setOutOfStockPreview] = useState<MenuItem[]>([]);
  const [upcomingEventsPreview, setUpcomingEventsPreview] = useState<EventItem[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getDashboard();
      setMetrics(data.metrics);
      setRecentReservations(data.recentReservations);
      setBlockedSlotsPreview(data.blockedSlotsPreview);
      setOutOfStockPreview(data.outOfStockPreview);
      setUpcomingEventsPreview(data.upcomingEventsPreview);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard statistics from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateStatus = async (id: string, status: Reservation['status']) => {
    try {
      await adminApi.updateReservationStatus(id, status);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to update reservation status.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <RefreshCw size={28} className="text-[#873A35] animate-spin mx-auto" />
        <p className="text-xs font-mono uppercase tracking-widest text-[#70452D]">
          Querying server metrics &amp; store...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xs space-y-3">
        <div className="flex items-center gap-2 text-red-800 text-sm font-semibold">
          <AlertTriangle size={18} />
          <span>Error loading server data</span>
        </div>
        <p className="text-xs text-red-700 leading-relaxed">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#873A35] text-[#FFF3DF] text-xs font-mono uppercase tracking-wider rounded-full hover:bg-[#70452D] cursor-pointer"
        >
          <RefreshCw size={13} />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* ================= HEADER & QUICK ACTION BAR ================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#DCCBB4]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#873A35] uppercase tracking-widest mb-1">
            <span>OPERATIONAL SUMMARY</span>
            <span>✦</span>
            <span>LIVE DATA</span>
          </div>
          <h1 className="font-editorial-display text-2xl sm:text-3xl text-[#292723] font-medium tracking-tight">
            Café Operations Overview
          </h1>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('reservations')}
            className="inline-flex items-center gap-1.5 bg-[#873A35] text-[#FFF3DF] text-xs font-mono uppercase tracking-wider px-3.5 py-2 rounded-full hover:bg-[#70452D] transition-colors cursor-pointer shadow-xs"
          >
            <CalendarCheck2 size={13} />
            <span>Manage Bookings</span>
          </button>

          <button
            onClick={() => onNavigateTab('availability')}
            className="inline-flex items-center gap-1.5 bg-[#FFF3DF] border border-[#DCCBB4] text-[#70452D] hover:text-[#292723] text-xs font-mono uppercase tracking-wider px-3.5 py-2 rounded-full hover:bg-white transition-colors cursor-pointer"
          >
            <Clock size={13} />
            <span>Slots &amp; Closures</span>
          </button>

          <button
            onClick={() => onNavigateTab('menu')}
            className="inline-flex items-center gap-1.5 bg-[#FFF3DF] border border-[#DCCBB4] text-[#70452D] hover:text-[#292723] text-xs font-mono uppercase tracking-wider px-3.5 py-2 rounded-full hover:bg-white transition-colors cursor-pointer"
          >
            <UtensilsCrossed size={13} />
            <span>Menu Items</span>
          </button>

          <button
            onClick={fetchDashboardData}
            title="Refresh statistics"
            className="p-2 border border-[#DCCBB4] rounded-full text-[#70452D] hover:bg-white transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Pending Reservations Alert Banner */}
      {(metrics?.pendingReservations ?? 0) > 0 && (
        <div
          onClick={() => onNavigateTab('reservations')}
          className="bg-amber-50 border border-amber-300 p-3.5 rounded-xs flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-100/70 transition-colors shadow-2xs"
        >
          <div className="flex items-center gap-2.5 text-xs text-amber-950 font-medium">
            <AlertTriangle size={16} className="text-amber-700 shrink-0" />
            <span>
              <strong>{metrics?.pendingReservations} pending reservation{metrics?.pendingReservations === 1 ? '' : 's'}</strong> awaiting staff review.
            </span>
          </div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 font-semibold underline shrink-0">
            Review Bookings &rarr;
          </span>
        </div>
      )}

      {/* ================= 6 STATISTIC METRIC CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Metric 1: Total Reservations */}
        <div
          onClick={() => onNavigateTab('reservations')}
          className="bg-[#FFF3DF] border border-[#DCCBB4] p-4 rounded-xs shadow-xs hover:border-[#873A35] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#70452D] mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Total Bookings</span>
            <CalendarCheck2 size={16} className="text-[#873A35]" />
          </div>
          <div className="font-editorial-display text-3xl font-bold text-[#292723] group-hover:text-[#873A35] transition-colors">
            {metrics?.totalReservations ?? 0}
          </div>
          <div className="text-[10px] font-mono text-[#70452D]/70 mt-1">
            All-time recorded in database
          </div>
        </div>

        {/* Metric 2: Today's Reservations */}
        <div
          onClick={() => onNavigateTab('reservations')}
          className="bg-[#FFF3DF] border border-[#DCCBB4] p-4 rounded-xs shadow-xs hover:border-[#873A35] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#70452D] mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Today</span>
            <Calendar size={16} className="text-[#873A35]" />
          </div>
          <div className="font-editorial-display text-3xl font-bold text-[#873A35]">
            {metrics?.todayReservations ?? 0}
          </div>
          <div className="text-[10px] font-mono text-[#70452D]/70 mt-1">
            Active bookings for today
          </div>
        </div>

        {/* Metric 3: Upcoming Reservations */}
        <div
          onClick={() => onNavigateTab('reservations')}
          className="bg-[#FFF3DF] border border-[#DCCBB4] p-4 rounded-xs shadow-xs hover:border-[#873A35] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#70452D] mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Upcoming</span>
            <Users size={16} className="text-[#29445A]" />
          </div>
          <div className="font-editorial-display text-3xl font-bold text-[#292723]">
            {metrics?.upcomingReservations ?? 0}
          </div>
          <div className="text-[10px] font-mono text-[#70452D]/70 mt-1">
            Confirmed future visits
          </div>
        </div>

        {/* Metric 4: Blocked Slots & Dates */}
        <div
          onClick={() => onNavigateTab('availability')}
          className="bg-[#FFF3DF] border border-[#DCCBB4] p-4 rounded-xs shadow-xs hover:border-[#873A35] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#70452D] mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Blocked Slots</span>
            <Clock size={16} className="text-[#873A35]" />
          </div>
          <div className="font-editorial-display text-3xl font-bold text-[#70452D]">
            {metrics?.blockedSlotsCount ?? 0}
          </div>
          <div className="text-[10px] font-mono text-[#70452D]/70 mt-1">
            {metrics?.blockedDatesCount ?? 0} full blackout days
          </div>
        </div>

        {/* Metric 5: Out of Stock */}
        <div
          onClick={() => onNavigateTab('menu')}
          className="bg-[#FFF3DF] border border-[#DCCBB4] p-4 rounded-xs shadow-xs hover:border-[#873A35] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#70452D] mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Out of Stock</span>
            <UtensilsCrossed size={16} className="text-amber-700" />
          </div>
          <div className={`font-editorial-display text-3xl font-bold ${
            (metrics?.outOfStockCount ?? 0) > 0 ? 'text-amber-700' : 'text-emerald-700'
          }`}>
            {metrics?.outOfStockCount ?? 0}
          </div>
          <div className="text-[10px] font-mono text-[#70452D]/70 mt-1">
            Menu items marked unavailable
          </div>
        </div>

        {/* Metric 6: Upcoming Events */}
        <div
          onClick={() => onNavigateTab('events')}
          className="bg-[#FFF3DF] border border-[#DCCBB4] p-4 rounded-xs shadow-xs hover:border-[#873A35] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#70452D] mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Active Events</span>
            <Sparkles size={16} className="text-[#873A35]" />
          </div>
          <div className="font-editorial-display text-3xl font-bold text-[#292723]">
            {metrics?.upcomingEventsCount ?? 0}
          </div>
          <div className="text-[10px] font-mono text-[#70452D]/70 mt-1">
            Published on customer site
          </div>
        </div>

      </div>

      {/* ================= RECENT RESERVATIONS SECTION ================= */}
      <div className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#DCCBB4] flex items-center justify-between bg-[#FFF3DF]">
          <div>
            <h2 className="font-editorial-sans text-lg font-semibold text-[#292723]">
              Recent Table Reservations
            </h2>
            <p className="text-xs text-[#70452D] font-light">
              Real requests recorded via the website booking modal or admin desk
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('reservations')}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#873A35] hover:text-[#70452D] cursor-pointer"
          >
            <span>View All ({metrics?.totalReservations ?? 0})</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {recentReservations.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-[#F1E9DC]/30">
            <CalendarCheck2 size={36} className="text-[#70452D]/40 mx-auto" />
            <h3 className="font-editorial-display text-xl text-[#292723]">No Reservations Stored Yet</h3>
            <p className="text-xs text-[#70452D] font-light max-w-sm mx-auto leading-relaxed">
              When customers book tables via the website or when reservations are recorded in the admin console, they will appear here in real time.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigateTab('reservations')}
                className="inline-flex items-center gap-1.5 bg-[#873A35] text-[#FFF3DF] text-xs font-mono uppercase tracking-wider px-4 py-2 rounded-full hover:bg-[#70452D] cursor-pointer"
              >
                <Plus size={13} />
                <span>Record New Reservation</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#F1E9DC] border-b border-[#DCCBB4] font-mono text-[11px] text-[#70452D] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ref Code</th>
                  <th className="py-3 px-4">Guest Name</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Party Size</th>
                  <th className="py-3 px-4">Seating Zone</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCCBB4]/60">
                {recentReservations.map((res) => {
                  const statusColors = {
                    confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                    pending: 'bg-amber-100 text-amber-800 border-amber-300',
                    completed: 'bg-slate-100 text-slate-800 border-slate-300',
                    cancelled: 'bg-rose-100 text-rose-800 border-rose-300',
                  }[res.status] || 'bg-gray-100 text-gray-800 border-gray-300';

                  return (
                    <tr key={res.id} className="hover:bg-white/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#873A35]">
                        {res.reference}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#292723]">
                        {res.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#70452D]">
                        {res.date} <span className="text-[#292723] font-medium">({res.time})</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[#292723]">{res.guests} Guests</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#70452D]">
                        {res.zone}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#70452D]">
                        <a href={`tel:${res.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-[#873A35] underline decoration-[#DCCBB4]">
                          {res.phone}
                        </a>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${statusColors}`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <select
                          value={res.status}
                          onChange={(e) => handleUpdateStatus(res.id, e.target.value as Reservation['status'])}
                          className="text-[11px] font-mono bg-white border border-[#DCCBB4] rounded px-2 py-1 text-[#292723] focus:outline-hidden focus:border-[#873A35] cursor-pointer"
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= SECONDARY SPLIT: BLOCKED SLOTS & STOCK ALERTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Availability / Blocked Slots Widget */}
        <div className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCCBB4]">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#873A35]" />
              <h3 className="font-editorial-sans text-base font-semibold text-[#292723]">
                Availability &amp; Blocked Slots
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('availability')}
              className="text-xs font-mono uppercase text-[#873A35] hover:underline cursor-pointer"
            >
              Configure Slots
            </button>
          </div>

          {blockedSlotsPreview.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#70452D] font-light space-y-1">
              <CheckCircle2 size={24} className="text-emerald-600 mx-auto mb-1" />
              <p>All standard seating slots are open for reservations.</p>
              <p className="text-[11px] font-mono text-[#70452D]/70">No blackout periods or blocked slots currently active.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {blockedSlotsPreview.map((slot, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-white border border-[#DCCBB4]/70 rounded-xs text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="font-semibold text-[#292723]">{slot.date}</span>
                    <span className="text-[#873A35]">at {slot.time}</span>
                  </div>
                  <span className="text-[11px] text-[#70452D]/80">
                    {slot.reason || 'Blocked by Admin'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Out of Stock Items Alert Widget */}
        <div className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCCBB4]">
            <div className="flex items-center gap-2">
              <UtensilsCrossed size={16} className="text-[#873A35]" />
              <h3 className="font-editorial-sans text-base font-semibold text-[#292723]">
                Menu Availability Alerts
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('menu')}
              className="text-xs font-mono uppercase text-[#873A35] hover:underline cursor-pointer"
            >
              Manage Stock
            </button>
          </div>

          {outOfStockPreview.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#70452D] font-light space-y-1">
              <CheckCircle2 size={24} className="text-emerald-600 mx-auto mb-1" />
              <p>All menu items are currently in stock and available.</p>
              <p className="text-[11px] font-mono text-[#70452D]/70">Both POURED and PLATED selections are active.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {outOfStockPreview.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 bg-white border border-amber-200 rounded-xs text-xs"
                >
                  <div>
                    <span className="font-medium text-[#292723]">{item.name}</span>
                    <span className="text-[11px] font-mono text-[#70452D] ml-2">({item.categoryTitle})</span>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-mono uppercase">
                    Out of Stock
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
