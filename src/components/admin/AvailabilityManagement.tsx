import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  RefreshCw,
  Info,
  Users,
} from 'lucide-react';
import { adminApi, BlockedDate, BlockedSlot } from '../../services/adminApi';
import { publicApi, AvailabilityResult } from '../../services/publicApi';

export const AvailabilityManagement: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [availabilityData, setAvailabilityData] = useState<AvailabilityResult | null>(null);
  const [allBlockedDates, setAllBlockedDates] = useState<BlockedDate[]>([]);
  const [allBlockedSlots, setAllBlockedSlots] = useState<BlockedSlot[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [defaultCapacity, setDefaultCapacity] = useState<number>(20);

  // Modals / forms
  const [blockDateModalOpen, setBlockDateModalOpen] = useState(false);
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockDateReason, setNewBlockDateReason] = useState('');

  const [blockingSlot, setBlockingSlot] = useState<string | null>(null);
  const [slotReason, setSlotReason] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch admin config
      const adminAvail = await adminApi.getAvailability();
      setAllBlockedDates(adminAvail.blockedDates);
      setAllBlockedSlots(adminAvail.blockedSlots);
      setTimeSlots(adminAvail.timeSlots);
      setDefaultCapacity(adminAvail.defaultCapacity);

      // Fetch specific date availability
      const dateAvail = await publicApi.checkAvailability(selectedDate);
      setAvailabilityData(dateAvail);
    } catch (err: any) {
      setError(err.message || 'Failed to load availability data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const handleToggleSlot = async (time: string, isCurrentlyBlocked: boolean) => {
    try {
      if (isCurrentlyBlocked) {
        await adminApi.unblockSlot(selectedDate, time);
      } else {
        await adminApi.blockSlot(selectedDate, time, slotReason || 'Admin blocked slot');
        setBlockingSlot(null);
        setSlotReason('');
      }
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update slot status.');
    }
  };

  const handleBlockDateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockDate) return;
    try {
      await adminApi.blockDate(newBlockDate, newBlockDateReason || 'Private gathering / Closed');
      setBlockDateModalOpen(false);
      setNewBlockDate('');
      setNewBlockDateReason('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to block date.');
    }
  };

  const handleUnblockDate = async (date: string) => {
    try {
      await adminApi.unblockDate(date);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to unblock date.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DCCBB4]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#873A35] uppercase tracking-widest mb-1">
            <span>SEATING CAPACITY &amp; RULES</span>
            <span>✦</span>
            <span>CONCURRENCY CONTROL</span>
          </div>
          <h1 className="font-editorial-display text-2xl sm:text-3xl text-[#292723] font-medium tracking-tight">
            Availability &amp; Slots Management
          </h1>
        </div>

        <button
          onClick={loadData}
          title="Refresh Data"
          className="self-start sm:self-auto p-2.5 border border-[#DCCBB4] rounded-full text-[#70452D] hover:bg-white transition-colors cursor-pointer"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Date Inspection Bar */}
      <div className="bg-[#FFF3DF] border border-[#DCCBB4] p-5 rounded-xs shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#70452D] mb-1.5 flex items-center gap-2">
              <Calendar size={14} className="text-[#873A35]" />
              <span>Inspect Seating Slots for Date</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setNewBlockDate(selectedDate);
                setBlockDateModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 bg-[#873A35]/15 hover:bg-[#873A35]/25 text-[#873A35] text-xs font-mono uppercase tracking-wider px-4 py-2 rounded-full transition-colors cursor-pointer"
            >
              <Lock size={13} />
              <span>Block Full Date</span>
            </button>
          </div>
        </div>

        {availabilityData?.isDateBlocked && (
          <div className="p-3 bg-red-100/80 border border-red-300 rounded-xs flex items-center justify-between text-xs text-red-900">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-700" />
              <span>
                <strong>FULL DAY BLOCKED:</strong> This date is marked unavailable for online and desk reservations.
              </span>
            </div>
            <button
              onClick={() => handleUnblockDate(selectedDate)}
              className="text-xs font-mono underline font-semibold uppercase hover:text-red-700 cursor-pointer"
            >
              Reopen Date
            </button>
          </div>
        )}
      </div>

      {/* Daily Slots Status Grid */}
      <div className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs shadow-xs p-6 space-y-6">
        <div>
          <h2 className="font-editorial-sans text-lg font-semibold text-[#292723]">
            Seating Intervals &amp; Slot Status on {selectedDate}
          </h2>
          <p className="text-xs text-[#70452D] font-light">
            Server enforces slot capacity (max {defaultCapacity} guests/slot). Blocked slots are immediately disabled on the public booking modal.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-[#70452D]">
            Loading slot allocations...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {timeSlots.map((slotTime) => {
              const isBlocked = availabilityData?.blockedSlots.includes(slotTime);
              const bookedCount = availabilityData?.slotBookingCounts[slotTime] || 0;
              const isFull = bookedCount >= defaultCapacity;

              return (
                <div
                  key={slotTime}
                  className={`p-4 rounded-xs border transition-all ${
                    isBlocked
                      ? 'bg-rose-50/60 border-rose-300 text-rose-950'
                      : isFull
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : 'bg-white border-[#DCCBB4] text-[#292723]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold">{slotTime}</span>
                    {isBlocked ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-rose-200 text-rose-800">
                        Blocked
                      </span>
                    ) : isFull ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-200 text-amber-800">
                        Full
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800">
                        Available
                      </span>
                    )}
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#70452D]">
                      <span>Bookings</span>
                      <span>{bookedCount} / {defaultCapacity} max</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#DCCBB4]/40 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isBlocked
                            ? 'bg-rose-600'
                            : isFull
                            ? 'bg-amber-600'
                            : 'bg-emerald-600'
                        }`}
                        style={{
                          width: `${Math.min(100, (bookedCount / defaultCapacity) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Block / Reopen Action */}
                  <div>
                    {isBlocked ? (
                      <button
                        onClick={() => handleToggleSlot(slotTime, true)}
                        className="w-full py-1.5 text-xs font-mono uppercase tracking-wider bg-white border border-[#DCCBB4] hover:border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Unlock size={13} />
                        <span>Reopen Slot</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setBlockingSlot(slotTime)}
                        className="w-full py-1.5 text-xs font-mono uppercase tracking-wider bg-white border border-[#DCCBB4] hover:border-rose-600 text-rose-700 hover:bg-rose-50 rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Lock size={13} />
                        <span>Block Slot</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= ALL BLOCKED DATES & PRIVATE GATHERINGS ================= */}
      <div className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCCBB4]">
          <div>
            <h2 className="font-editorial-sans text-base font-semibold text-[#292723]">
              Full-Day Closures &amp; Private Gatherings ({allBlockedDates.length})
            </h2>
            <p className="text-xs text-[#70452D] font-light">
              Dates listed here prevent customer reservations for all seating zones and hours
            </p>
          </div>

          <button
            onClick={() => {
              setNewBlockDate('');
              setBlockDateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 bg-[#873A35] text-[#FFF3DF] text-xs font-mono uppercase tracking-wider px-3.5 py-1.5 rounded-full hover:bg-[#70452D] cursor-pointer"
          >
            <Plus size={13} />
            <span>Add Blocked Date</span>
          </button>
        </div>

        {allBlockedDates.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#70452D] font-light">
            No full-day closures configured. Café is open according to regular operating hours.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allBlockedDates.map((d) => (
              <div
                key={d.date}
                className="p-3 bg-white border border-[#DCCBB4] rounded-xs flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-mono font-bold text-[#873A35]">{d.date}</div>
                  <div className="text-[11px] text-[#70452D]">{d.reason || 'Closed / Private'}</div>
                </div>
                <button
                  onClick={() => handleUnblockDate(d.date)}
                  title="Remove Block"
                  className="p-1.5 text-[#70452D] hover:text-rose-700 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= BLOCK SLOT MODAL ================= */}
      {blockingSlot && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-editorial-sans text-xl font-medium text-[#292723]">
              Block {blockingSlot} Seating
            </h3>
            <p className="text-xs text-[#70452D]">
              Prevent reservations on <strong className="font-mono text-[#292723]">{selectedDate}</strong> at <strong className="font-mono text-[#873A35]">{blockingSlot}</strong>.
            </p>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                Reason / Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Private cupping, maintenance, VIP table"
                value={slotReason}
                onChange={(e) => setSlotReason(e.target.value)}
                className="w-full text-xs bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setBlockingSlot(null);
                  setSlotReason('');
                }}
                className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#70452D] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleSlot(blockingSlot, false)}
                className="px-5 py-2 text-xs font-mono uppercase tracking-wider bg-[#873A35] text-[#FFF3DF] rounded-full hover:bg-[#70452D] cursor-pointer"
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BLOCK DATE MODAL ================= */}
      {blockDateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-editorial-sans text-xl font-medium text-[#292723]">
              Block Calendar Date
            </h3>
            <form onSubmit={handleBlockDateSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                  Select Date *
                </label>
                <input
                  type="date"
                  required
                  value={newBlockDate}
                  onChange={(e) => setNewBlockDate(e.target.value)}
                  className="w-full text-xs font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                  Reason for Closure / Private Event
                </label>
                <input
                  type="text"
                  placeholder="e.g. Festival holiday, private reception"
                  value={newBlockDateReason}
                  onChange={(e) => setNewBlockDateReason(e.target.value)}
                  className="w-full text-xs bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBlockDateModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#70452D] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-mono uppercase tracking-wider bg-[#873A35] text-[#FFF3DF] rounded-full hover:bg-[#70452D] cursor-pointer"
                >
                  Block Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
