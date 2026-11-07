import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  Search,
  Filter,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  Mail,
  FileText,
  X,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
  Edit2,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { adminApi, Reservation } from '../../services/adminApi';

export const ReservationManagement: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Modals
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Edit Modal State
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    guests: '2',
    zone: 'The Courtyard',
    notes: '',
    status: 'confirmed' as Reservation['status'],
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    phone: '',
    email: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    guests: '2',
    zone: 'The Courtyard',
    notes: '',
    isOverride: false,
    overrideReason: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getReservations({
        date: dateFilter || undefined,
        status: statusFilter,
        search: searchQuery || undefined,
      });
      setReservations(data.reservations);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter, dateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReservations();
  };

  const handleUpdateStatus = async (id: string, status: Reservation['status']) => {
    try {
      const res = await adminApi.updateReservationStatus(id, status);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? res.reservation : r))
      );
      if (selectedReservation?.id === id) {
        setSelectedReservation(res.reservation);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update reservation status.');
    }
  };

  const handleConfirmCancel = async () => {
    if (!reservationToDelete) return;
    try {
      await adminApi.cancelReservation(reservationToDelete.id);
      setReservations((prev) => prev.filter((r) => r.id !== reservationToDelete.id));
      if (selectedReservation?.id === reservationToDelete.id) {
        setSelectedReservation(null);
      }
      setReservationToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel reservation.');
    }
  };

  // Duplicate Booking Warning Check
  useEffect(() => {
    if (!createModalOpen) {
      setDuplicateWarning(null);
      return;
    }
    const phone = createForm.phone.trim();
    if (phone.length >= 8 && createForm.date) {
      const timer = setTimeout(async () => {
        try {
          const res = await adminApi.checkDuplicateReservation(phone, createForm.date);
          if (res.isDuplicate && res.matches && res.matches.length > 0) {
            const first = res.matches[0];
            setDuplicateWarning(
              `Notice: An existing booking already exists for "${first.name}" (${first.reference} · ${first.time}) on this date.`
            );
          } else {
            setDuplicateWarning(null);
          }
        } catch {
          setDuplicateWarning(null);
        }
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setDuplicateWarning(null);
    }
  }, [createForm.phone, createForm.date, createModalOpen]);

  const openEditModal = (res: Reservation) => {
    setEditingReservation(res);
    setEditForm({
      name: res.name,
      phone: res.phone,
      email: res.email || '',
      date: res.date,
      time: res.time,
      guests: String(res.guests),
      zone: res.zone,
      notes: res.notes || '',
      status: res.status,
    });
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReservation) return;
    setEditError(null);
    try {
      setEditLoading(true);
      const res = await adminApi.updateReservation(editingReservation.id, editForm);
      setReservations((prev) =>
        prev.map((r) => (r.id === editingReservation.id ? res.reservation : r))
      );
      if (selectedReservation?.id === editingReservation.id) {
        setSelectedReservation(res.reservation);
      }
      setEditingReservation(null);
    } catch (err: any) {
      setEditError(err.message || 'Failed to update reservation.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (createForm.isOverride && !createForm.overrideReason.trim()) {
      setCreateError('An override reason is required when manager override is active.');
      return;
    }
    try {
      setCreateLoading(true);
      await adminApi.createAdminReservation(createForm);

      setCreateModalOpen(false);
      setCreateForm({
        name: '',
        phone: '',
        email: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        guests: '2',
        zone: 'The Courtyard',
        notes: '',
        isOverride: false,
        overrideReason: '',
      });
      setDuplicateWarning(null);
      fetchReservations();
    } catch (err: any) {
      setCreateError(err.message || 'Could not record reservation.');
    } finally {
      setCreateLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DCCBB4]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#873A35] uppercase tracking-widest mb-1">
            <span>HOSPITALITY DESK</span>
            <span>✦</span>
            <span>TABLE MANAGEMENT</span>
          </div>
          <h1 className="font-editorial-display text-2xl sm:text-3xl text-[#292723] font-medium tracking-tight">
            Guest Reservations
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-[#873A35] text-[#FFF3DF] text-xs font-mono uppercase tracking-wider px-4 py-2.5 rounded-full hover:bg-[#70452D] transition-colors cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            <span>New Reservation</span>
          </button>

          <button
            onClick={fetchReservations}
            title="Refresh List"
            className="p-2.5 border border-[#DCCBB4] rounded-full text-[#70452D] hover:bg-white transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFF3DF] border border-[#DCCBB4] p-4 rounded-xs shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search by guest name, phone, email, or MRD- code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-sans bg-white border border-[#DCCBB4] rounded-xs pl-9 pr-20 py-2.5 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
            />
            <Search size={15} className="absolute left-3 top-3 text-[#70452D]/60 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bg-[#873A35] text-[#FFF3DF] text-[10px] font-mono uppercase tracking-wider px-2.5 py-1.5 rounded-xs hover:bg-[#70452D] cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Quick Date Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <span className="text-[#70452D] uppercase text-[11px] mr-1">Date:</span>
            <button
              onClick={() => setDateFilter('')}
              className={`px-3 py-1.5 rounded-xs uppercase tracking-wider border cursor-pointer ${
                dateFilter === ''
                  ? 'bg-[#873A35] text-[#FFF3DF] border-[#873A35]'
                  : 'bg-white text-[#70452D] border-[#DCCBB4] hover:border-[#873A35]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDateFilter(todayStr)}
              className={`px-3 py-1.5 rounded-xs uppercase tracking-wider border cursor-pointer ${
                dateFilter === todayStr
                  ? 'bg-[#873A35] text-[#FFF3DF] border-[#873A35]'
                  : 'bg-white text-[#70452D] border-[#DCCBB4] hover:border-[#873A35]'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter(tomorrowStr)}
              className={`px-3 py-1.5 rounded-xs uppercase tracking-wider border cursor-pointer ${
                dateFilter === tomorrowStr
                  ? 'bg-[#873A35] text-[#FFF3DF] border-[#873A35]'
                  : 'bg-white text-[#70452D] border-[#DCCBB4] hover:border-[#873A35]'
              }`}
            >
              Tomorrow
            </button>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-xs font-mono bg-white border border-[#DCCBB4] rounded-xs px-2.5 py-1 text-[#292723] focus:outline-hidden"
              title="Custom Date Filter"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#70452D] uppercase text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-[#DCCBB4] rounded-xs px-3 py-1.5 text-[#292723] focus:outline-hidden focus:border-[#873A35] uppercase text-xs cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Reservations Table */}
      <div className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw size={24} className="text-[#873A35] animate-spin mx-auto" />
            <p className="text-xs font-mono uppercase tracking-widest text-[#70452D]">
              Loading table bookings from database...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-700 text-xs">
            {error}
          </div>
        ) : reservations.length === 0 ? (
          <div className="p-16 text-center space-y-3 bg-[#F1E9DC]/30">
            <CalendarCheck2 size={36} className="text-[#70452D]/40 mx-auto" />
            <h3 className="font-editorial-display text-xl text-[#292723]">No Reservations Found</h3>
            <p className="text-xs text-[#70452D] font-light max-w-sm mx-auto leading-relaxed">
              {searchQuery || dateFilter || statusFilter !== 'all'
                ? 'No bookings matched your filter criteria. Try resetting filters or search query.'
                : 'There are no reservation records stored in the database yet.'}
            </p>
            {(searchQuery || dateFilter || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDateFilter('');
                  setStatusFilter('all');
                }}
                className="text-xs font-mono text-[#873A35] underline uppercase tracking-wider cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#F1E9DC] border-b border-[#DCCBB4] font-mono text-[11px] text-[#70452D] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Ref Code</th>
                    <th className="py-3 px-4">Guest</th>
                    <th className="py-3 px-4">Date &amp; Time</th>
                    <th className="py-3 px-4">Party</th>
                    <th className="py-3 px-4">Zone</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCCBB4]/60">
                  {reservations.map((res) => {
                    const statusColors = {
                      confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                      pending: 'bg-amber-100 text-amber-800 border-amber-300',
                      completed: 'bg-slate-100 text-slate-800 border-slate-300',
                      cancelled: 'bg-rose-100 text-rose-800 border-rose-300',
                    }[res.status] || 'bg-gray-100 text-gray-800 border-gray-300';

                    return (
                      <tr
                        key={res.id}
                        onClick={() => setSelectedReservation(res)}
                        className="hover:bg-white/70 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-[#873A35]">
                          {res.reference}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[#292723]">
                          {res.name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#70452D]">
                          {res.date} <span className="font-semibold text-[#292723]">({res.time})</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#292723]">
                          {res.guests} Guests
                        </td>
                        <td className="py-3.5 px-4 text-[#70452D]">
                          {res.zone}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#70452D]">
                          {res.phone}
                        </td>
                        <td className="py-3.5 px-4 text-[#70452D] max-w-xs truncate">
                          {res.notes || '—'}
                        </td>
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${statusColors}`}>
                            {res.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={res.status}
                              onChange={(e) =>
                                handleUpdateStatus(res.id, e.target.value as Reservation['status'])
                              }
                              className="text-[11px] font-mono bg-white border border-[#DCCBB4] rounded px-2 py-1 text-[#292723] focus:outline-hidden focus:border-[#873A35] cursor-pointer"
                            >
                              <option value="confirmed">Confirmed</option>
                              <option value="pending">Pending</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>

                            <button
                              onClick={() => openEditModal(res)}
                              title="Edit Reservation"
                              className="p-1.5 text-[#70452D]/60 hover:text-[#873A35] transition-colors cursor-pointer"
                            >
                              <Edit2 size={14} />
                            </button>

                            <button
                              onClick={() => setReservationToDelete(res)}
                              title="Cancel Reservation"
                              className="p-1.5 text-[#70452D]/60 hover:text-red-700 transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (<768px) */}
            <div className="block md:hidden divide-y divide-[#DCCBB4]/60">
              {reservations.map((res) => {
                const statusColors = {
                  confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                  pending: 'bg-amber-100 text-amber-800 border-amber-300',
                  completed: 'bg-slate-100 text-slate-800 border-slate-300',
                  cancelled: 'bg-rose-100 text-rose-800 border-rose-300',
                }[res.status] || 'bg-gray-100 text-gray-800 border-gray-300';

                return (
                  <div
                    key={res.id}
                    onClick={() => setSelectedReservation(res)}
                    className="p-4 bg-white/50 hover:bg-white/80 transition-colors cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#873A35]">
                          {res.reference}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${statusColors}`}>
                          {res.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openEditModal(res)}
                          className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-[#70452D] hover:text-[#873A35] rounded hover:bg-[#DCCBB4]/30"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setReservationToDelete(res)}
                          className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-red-600 hover:text-red-800 rounded hover:bg-red-50"
                          title="Cancel"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm text-[#292723]">{res.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-[#70452D] mt-0.5 font-mono">
                          <Users size={12} className="text-[#873A35]" />
                          <span>{res.guests} Guests</span>
                          <span>·</span>
                          <MapPin size={12} className="text-[#873A35]" />
                          <span>{res.zone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#DCCBB4]/40 text-xs font-mono text-[#70452D]">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-[#873A35]" />
                        <span>{res.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-[#873A35]" />
                        <span className="font-semibold text-[#292723]">{res.time}</span>
                      </div>
                      <div className="flex items-center gap-1 ml-auto" onClick={(e) => e.stopPropagation()}>
                        <Phone size={12} className="text-[#873A35]" />
                        <a href={`tel:${res.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-[#873A35] underline">
                          {res.phone}
                        </a>
                      </div>
                    </div>

                    {res.notes && (
                      <p className="text-xs text-[#70452D] bg-[#FFF3DF] p-2 rounded-xs italic">
                        {res.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[#DCCBB4]/30" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[11px] font-mono text-[#70452D] uppercase">Status:</span>
                      <select
                        value={res.status}
                        onChange={(e) => handleUpdateStatus(res.id, e.target.value as Reservation['status'])}
                        className="text-xs font-mono bg-white border border-[#DCCBB4] rounded px-2.5 py-1.5 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ================= RESERVATION DETAIL MODAL ================= */}
      {selectedReservation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#DCCBB4]">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#873A35] font-semibold block">
                  RESERVATION DOSSIER
                </span>
                <h3 className="font-editorial-display text-2xl font-medium text-[#292723]">
                  {selectedReservation.reference}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReservation(null)}
                className="p-1.5 text-[#70452D] hover:text-[#292723] rounded-full hover:bg-[#DCCBB4]/40 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Details Grid */}
            <div className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4 p-4 bg-white/70 border border-[#DCCBB4]/60 rounded-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#70452D] block mb-1">
                    Guest Name
                  </span>
                  <span className="font-semibold text-sm text-[#292723]">{selectedReservation.name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#70452D] block mb-1">
                    Party Size
                  </span>
                  <span className="font-semibold text-sm text-[#292723]">{selectedReservation.guests} Guests</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#70452D] block mb-1">
                    Date &amp; Time
                  </span>
                  <span className="font-mono text-[#292723]">{selectedReservation.date} · {selectedReservation.time}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#70452D] block mb-1">
                    Seating Area
                  </span>
                  <span className="font-medium text-[#292723]">{selectedReservation.zone}</span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2 p-4 bg-white/70 border border-[#DCCBB4]/60 rounded-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#70452D] block mb-1">
                  Contact Information
                </span>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <Phone size={13} className="text-[#873A35]" />
                  <a href={`tel:${selectedReservation.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-[#873A35] underline">
                    {selectedReservation.phone}
                  </a>
                </div>
                {selectedReservation.email && (
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <Mail size={13} className="text-[#873A35]" />
                    <a href={`mailto:${selectedReservation.email}`} className="hover:text-[#873A35] underline">
                      {selectedReservation.email}
                    </a>
                  </div>
                )}
              </div>

              {/* Special Notes */}
              <div className="p-4 bg-white/70 border border-[#DCCBB4]/60 rounded-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#70452D] block mb-1">
                  Special Notes &amp; Dietary Requests
                </span>
                <p className="text-xs text-[#292723] italic leading-relaxed">
                  {selectedReservation.notes || 'No special requests or dietary notes specified.'}
                </p>
              </div>

              {/* Timestamps */}
              <div className="text-[11px] font-mono text-[#70452D]/75 flex items-center justify-between px-1">
                <span>Booked: {new Date(selectedReservation.createdAt).toLocaleString('en-IN')}</span>
                <span>Last Updated: {new Date(selectedReservation.updatedAt).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Status Change & Actions Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#DCCBB4]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#70452D] uppercase">Status:</span>
                <select
                  value={selectedReservation.status}
                  onChange={(e) =>
                    handleUpdateStatus(
                      selectedReservation.id,
                      e.target.value as Reservation['status']
                    )
                  }
                  className="text-xs font-mono bg-white border border-[#DCCBB4] rounded px-3 py-1.5 text-[#292723] focus:outline-hidden focus:border-[#873A35] cursor-pointer"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    openEditModal(selectedReservation);
                    setSelectedReservation(null);
                  }}
                  className="text-xs font-mono uppercase text-[#873A35] hover:text-[#70452D] cursor-pointer flex items-center gap-1.5"
                >
                  <Edit2 size={13} />
                  <span>Edit Details</span>
                </button>

                <button
                  onClick={() => {
                    setReservationToDelete(selectedReservation);
                    setSelectedReservation(null);
                  }}
                  className="text-xs font-mono uppercase text-red-700 hover:text-red-900 cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  <span>Cancel &amp; Delete</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= EDIT RESERVATION MODAL ================= */}
      {editingReservation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#DCCBB4]">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#873A35] font-semibold block">
                  UPDATE RESERVATION
                </span>
                <h3 className="font-editorial-display text-2xl font-medium text-[#292723]">
                  {editingReservation.reference}
                </h3>
              </div>
              <button
                onClick={() => setEditingReservation(null)}
                className="p-1.5 text-[#70452D] hover:text-[#292723] rounded-full hover:bg-[#DCCBB4]/40 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xs text-xs text-red-800 flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-700" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Booking Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Time Slot *
                  </label>
                  <select
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  >
                    <option value="8:30 AM">8:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="4:30 PM">4:30 PM</option>
                    <option value="6:30 PM">6:30 PM</option>
                    <option value="8:00 PM">8:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Party Size
                  </label>
                  <select
                    value={editForm.guests}
                    onChange={(e) => setEditForm({ ...editForm, guests: e.target.value })}
                    className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  >
                    <option value="1">1 Person</option>
                    <option value="2">2 People</option>
                    <option value="3">3 People</option>
                    <option value="4">4 People</option>
                    <option value="5-6">5–6 People</option>
                    <option value="7+">7+ People</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Seating Area
                  </label>
                  <select
                    value={editForm.zone}
                    onChange={(e) => setEditForm({ ...editForm, zone: e.target.value })}
                    className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  >
                    <option value="The Courtyard">The Sunlit Courtyard</option>
                    <option value="The Colonnade">The Colonnade Walk</option>
                    <option value="The Brew Bar">Brew Bar Counter</option>
                    <option value="The Listening Nook">Indoor Listening Nook</option>
                    <option value="Terrace Amphitheatre">Rooftop Amphitheatre</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="guest@example.com"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Reservation['status'] })}
                    className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                  Notes &amp; Dietary Requirements
                </label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full bg-white border border-[#DCCBB4] rounded-xs p-2.5 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#DCCBB4]">
                <button
                  type="button"
                  onClick={() => setEditingReservation(null)}
                  className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#70452D] hover:text-[#292723] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2.5 bg-[#873A35] hover:bg-[#70452D] text-[#FFF3DF] text-xs font-mono uppercase tracking-wider rounded-full transition-colors cursor-pointer shadow-xs"
                >
                  {editLoading ? 'Saving Changes...' : 'Update Reservation'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ================= CANCEL CONFIRMATION DIALOG ================= */}
      {reservationToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-editorial-sans text-xl font-medium text-[#292723]">
              Confirm Cancellation
            </h3>
            <p className="text-xs text-[#70452D] leading-relaxed">
              Are you sure you want to cancel reservation <strong className="text-[#292723] font-mono">{reservationToDelete.reference}</strong> for <strong className="text-[#292723]">{reservationToDelete.name}</strong> on {reservationToDelete.date}?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setReservationToDelete(null)}
                className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#70452D] hover:text-[#292723] cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-5 py-2 text-xs font-mono uppercase tracking-wider bg-red-800 text-white hover:bg-red-900 rounded-full transition-colors cursor-pointer"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= NEW RESERVATION MODAL ================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#DCCBB4]">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#873A35] font-semibold block">
                  MANUAL BOOKING
                </span>
                <h3 className="font-editorial-display text-2xl font-medium text-[#292723]">
                  Record Table Reservation
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 text-[#70452D] hover:text-[#292723] rounded-full hover:bg-[#DCCBB4]/40 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xs text-xs text-red-800 flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-700" />
                <span>{createError}</span>
              </div>
            )}

            {duplicateWarning && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xs text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-700" />
                <span>{duplicateWarning}</span>
              </div>
            )}

            <form onSubmit={handleCreateReservation} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Guest full name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98000 00000"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Booking Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={createForm.date}
                    onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
                    className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Time Slot *
                  </label>
                  <select
                    value={createForm.time}
                    onChange={(e) => setCreateForm({ ...createForm, time: e.target.value })}
                    className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  >
                    <option value="8:30 AM">8:30 AM (Early Light)</option>
                    <option value="10:00 AM">10:00 AM (Morning Pour)</option>
                    <option value="12:00 PM">12:00 PM (Midday Dining)</option>
                    <option value="2:00 PM">2:00 PM (Afternoon Slow)</option>
                    <option value="4:30 PM">4:30 PM (Sunset Shadow)</option>
                    <option value="6:30 PM">6:30 PM (Dusk Coffee)</option>
                    <option value="8:00 PM">8:00 PM (Dinner &amp; Dessert)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Party Size
                  </label>
                  <select
                    value={createForm.guests}
                    onChange={(e) => setCreateForm({ ...createForm, guests: e.target.value })}
                    className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  >
                    <option value="1">1 Person</option>
                    <option value="2">2 People</option>
                    <option value="3">3 People</option>
                    <option value="4">4 People</option>
                    <option value="5-6">5–6 People</option>
                    <option value="7+">7+ People</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Seating Area
                  </label>
                  <select
                    value={createForm.zone}
                    onChange={(e) => setCreateForm({ ...createForm, zone: e.target.value })}
                    className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  >
                    <option value="The Courtyard">The Sunlit Courtyard</option>
                    <option value="The Colonnade">The Colonnade Walk</option>
                    <option value="The Brew Bar">Brew Bar Counter</option>
                    <option value="The Listening Nook">Indoor Listening Nook</option>
                    <option value="Terrace Amphitheatre">Rooftop Amphitheatre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="guest@example.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                  Notes &amp; Dietary Requirements (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Special table requests, allergies, anniversary, etc."
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  className="w-full bg-white border border-[#DCCBB4] rounded-xs p-2.5 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                />
              </div>

              {/* Staff / Manager Override Option */}
              <div className="p-3 bg-[#F1E9DC] border border-[#DCCBB4] rounded-xs space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createForm.isOverride}
                    onChange={(e) => setCreateForm({ ...createForm, isOverride: e.target.checked })}
                    className="accent-[#873A35] rounded-xs w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-semibold text-[#873A35] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert size={14} />
                    <span>Manager Override Capacity</span>
                  </span>
                </label>
                {createForm.isOverride && (
                  <div className="pt-2 space-y-1">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D]">
                      Override Reason (Required) *
                    </label>
                    <input
                      type="text"
                      required={createForm.isOverride}
                      placeholder="e.g. VIP table addition / Owner guest / Bar seating"
                      value={createForm.overrideReason}
                      onChange={(e) => setCreateForm({ ...createForm, overrideReason: e.target.value })}
                      className="w-full bg-white border border-[#DCCBB4] rounded-xs px-3 py-1.5 text-xs text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#DCCBB4]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#70452D] hover:text-[#292723] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-6 py-2.5 bg-[#873A35] hover:bg-[#70452D] text-[#FFF3DF] text-xs font-mono uppercase tracking-wider rounded-full transition-colors cursor-pointer shadow-xs"
                >
                  {createLoading ? 'Recording...' : 'Save Reservation'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
