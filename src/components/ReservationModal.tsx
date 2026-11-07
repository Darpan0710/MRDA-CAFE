import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Calendar, Clock, Users, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { CAFE_DETAILS } from '../data/cafeData';
import { useCafeSettings } from '../services/cafeSettings';
import { publicApi, AvailabilityResult } from '../services/publicApi';
import {
  getTodayDateStringIST,
  ALLOWED_TIME_SLOTS,
  isSlotElapsedIST,
  isDateInPastIST,
} from '../utils/dateUtils';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const settings = useCafeSettings();
  const todayIST = getTodayDateStringIST();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<{
    reference: string;
    name: string;
    phone: string;
    date: string;
    time: string;
    guests: string;
    zone: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: todayIST,
    time: '10:00 AM',
    guests: '2',
    zone: 'The Courtyard',
    notes: '',
  });

  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Check availability whenever date changes or modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Reset date if somehow past
    if (formData.date < todayIST) {
      setFormData((prev) => ({ ...prev, date: todayIST }));
      return;
    }

    const checkSlots = async () => {
      try {
        setCheckingAvailability(true);
        const data = await publicApi.checkAvailability(formData.date);
        setAvailability(data);

        // Pick first genuinely available slot if current selected slot is blocked, elapsed, or full
        const isCurrentUnavailable =
          !data.availableSlots ||
          !data.availableSlots.includes(formData.time) ||
          isSlotElapsedIST(formData.date, formData.time);

        if (isCurrentUnavailable && data.availableSlots && data.availableSlots.length > 0) {
          setFormData((prev) => ({ ...prev, time: data.availableSlots[0] }));
        }
      } catch (err) {
        // Fallback gracefully
      } finally {
        setCheckingAvailability(false);
      }
    };

    checkSlots();
  }, [formData.date, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Front-end safety checks
    if (isDateInPastIST(formData.date)) {
      setSubmitError('Reservations cannot be made for past dates. Please select today or a future date.');
      return;
    }

    if (isSlotElapsedIST(formData.date, formData.time)) {
      setSubmitError(`The ${formData.time} seating slot has already passed for ${formData.date}. Please select an upcoming slot.`);
      return;
    }

    if (availability?.isDateBlocked) {
      setSubmitError('The café is reserved for private gatherings or closed on this date.');
      return;
    }

    try {
      setLoading(true);
      const res = await publicApi.submitReservation(formData);
      setConfirmedReservation(res.reservation);
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Could not complete reservation request. Please try an alternate slot.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setConfirmedReservation(null);
    setSubmitError(null);
    onClose();
  };

  // Determine active slot choices from settings/availability or standard allowed slots
  const displayedSlots = (availability?.timeSlots && availability.timeSlots.length > 0)
    ? availability.timeSlots
    : ALLOWED_TIME_SLOTS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#F1E9DC] rounded-xs shadow-2xl border border-[#DCCBB4] overflow-hidden flex flex-col max-h-[92vh] animate-modal-enter">
        
        {/* Header */}
        <div className="px-6 py-4 sm:py-5 border-b border-[#DCCBB4] flex items-center justify-between bg-[#F1E9DC] shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-editorial-sans text-xl font-bold tracking-[0.18em] uppercase text-[#1A1815]">
              MRDĀ <span className="text-[#873A35] text-xs">✦</span>
            </span>
            <div className="h-4 w-[1px] bg-[#C5B39A]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#70452D] font-semibold">
              Table Reservation
            </span>
          </div>

          <button
            onClick={handleReset}
            className="p-2 text-[#292723] hover:text-[#873A35] transition-colors rounded-full hover:bg-[#DCCBB4]/40 cursor-pointer"
            aria-label="Close Reservation Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto">
          {submitted && confirmedReservation ? (
            <div className="text-center py-6 sm:py-8 space-y-4">
              <div className="h-16 w-16 bg-[#873A35]/15 text-[#873A35] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>

              <h3 className="text-2xl font-editorial-sans uppercase tracking-[0.05em] text-[#1A1815] font-semibold">
                Your Table is Confirmed
              </h3>

              <p className="text-xs sm:text-sm text-[#4A2D1B] font-normal max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="font-bold text-[#1A1815]">{confirmedReservation.name}</strong>. We have reserved a table for <strong className="font-bold text-[#1A1815]">{confirmedReservation.guests} guests</strong> in <strong className="font-bold text-[#1A1815]">{confirmedReservation.zone}</strong> on <strong className="font-bold text-[#873A35]">{confirmedReservation.date} at {confirmedReservation.time}</strong>.
              </p>

              <div className="p-4 bg-[#E8DDD0] rounded-xs text-xs font-mono text-[#292723] max-w-md mx-auto border border-[#C5B39A] space-y-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-[#70452D] font-semibold">
                    Reference
                  </span>
                  <span className="text-sm font-bold text-[#873A35] font-mono tracking-wider">
                    {confirmedReservation.reference}
                  </span>
                </div>
                <div className="text-[11px] text-[#523220] pt-1 border-t border-[#C5B39A]/50">
                  Confirmation SMS prepared for <span className="font-semibold">{confirmedReservation.phone}</span>. For changes, call{' '}
                  <a
                    href={`tel:${(settings.phone || CAFE_DETAILS.phone).replace(/[^0-9+]/g, '')}`}
                    className="underline text-[#873A35] font-semibold hover:text-[#70452D]"
                  >
                    {settings.phone || CAFE_DETAILS.phone}
                  </a>.
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleReset}
                  className="bg-[#873A35] text-[#FFF3DF] text-xs font-semibold tracking-widest uppercase px-7 py-3 rounded-full hover:bg-[#70452D] transition-colors cursor-pointer shadow-xs"
                >
                  Return to Café
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <span className="text-xs font-mono tracking-widest uppercase text-[#873A35] font-semibold block mb-1">
                  Ahmedabad Sanctuary
                </span>
                <h3 className="text-2xl font-editorial-sans uppercase tracking-[0.04em] text-[#1A1815] font-medium">
                  Book a Table
                </h3>
                <p className="text-xs text-[#523220] mt-1 font-normal leading-relaxed">
                  Reserve your pause for thoughtful conversations, breakfast, or slow coffee. Operating hours: 10:00 AM – 8:00 PM.
                </p>
              </div>

              {submitError && (
                <div className="p-3 bg-red-100/80 border border-red-300 rounded-xs text-xs text-red-950 font-medium flex items-start gap-2 animate-shake">
                  <AlertCircle size={16} className="text-red-700 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {availability?.isDateBlocked && (
                <div className="p-3 bg-amber-100/80 border border-amber-300 rounded-xs text-xs text-amber-950 font-medium flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-800 shrink-0" />
                  <span>The café is closed or fully reserved for a private gathering on this date. Please select another day.</span>
                </div>
              )}

              {/* Date & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#292723] font-semibold mb-1.5 flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#873A35]" />
                    <span>Select Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={todayIST}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full text-xs font-mono bg-white border border-[#C5B39A] rounded-xs px-3.5 py-2.5 text-[#1A1815] font-medium focus:outline-hidden focus:border-[#873A35] focus:ring-1 focus:ring-[#873A35] shadow-2xs"
                  />
                  {formData.date === todayIST && (
                    <span className="text-[10px] font-mono text-[#873A35] font-medium block mt-1">
                      Today · Elapsed slots are disabled automatically
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#292723] font-semibold mb-1.5 flex items-center gap-1.5">
                    <Clock size={13} className="text-[#873A35]" />
                    <span>Preferred Time (10 AM – 8 PM) *</span>
                    {checkingAvailability && (
                      <RefreshCw size={11} className="animate-spin text-[#873A35] ml-auto" />
                    )}
                  </label>
                  <select
                    value={formData.time}
                    disabled={availability?.isDateBlocked}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full text-xs font-mono bg-white border border-[#C5B39A] rounded-xs px-3.5 py-2.5 text-[#1A1815] font-medium focus:outline-hidden focus:border-[#873A35] focus:ring-1 focus:ring-[#873A35] disabled:opacity-50 shadow-2xs cursor-pointer"
                  >
                    {displayedSlots.map((slot) => {
                      const isElapsed =
                        availability?.elapsedSlots?.includes(slot) ||
                        isSlotElapsedIST(formData.date, slot);
                      const isBlocked = availability?.blockedSlots?.includes(slot);
                      const isFull =
                        (availability?.slotBookingCounts?.[slot] || 0) >=
                        (availability?.defaultCapacity || 20);
                      const isUnavailable = isElapsed || isBlocked || isFull;

                      let statusNote = '';
                      if (isElapsed) statusNote = '(Passed)';
                      else if (isBlocked) statusNote = '(Blocked)';
                      else if (isFull) statusNote = '(Full)';

                      return (
                        <option
                          key={slot}
                          value={slot}
                          disabled={isUnavailable}
                          className={isUnavailable ? 'text-gray-400 bg-gray-50' : 'text-[#1A1815] font-medium'}
                        >
                          {slot} {statusNote}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Guests & Seating Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#292723] font-semibold mb-1.5 flex items-center gap-1.5">
                    <Users size={13} className="text-[#873A35]" />
                    <span>Party Size *</span>
                  </label>
                  <select
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                    className="w-full text-xs font-mono bg-white border border-[#C5B39A] rounded-xs px-3.5 py-2.5 text-[#1A1815] font-medium focus:outline-hidden focus:border-[#873A35] focus:ring-1 focus:ring-[#873A35] shadow-2xs cursor-pointer"
                  >
                    <option value="1">1 Person (Quiet Corner)</option>
                    <option value="2">2 People (Pair Table)</option>
                    <option value="3">3 People</option>
                    <option value="4">4 People</option>
                    <option value="5-6">5–6 People</option>
                    <option value="7+">7+ People (Communal Table)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#292723] font-semibold mb-1.5 flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#873A35]" />
                    <span>Seating Zone *</span>
                  </label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full text-xs font-mono bg-white border border-[#C5B39A] rounded-xs px-3.5 py-2.5 text-[#1A1815] font-medium focus:outline-hidden focus:border-[#873A35] focus:ring-1 focus:ring-[#873A35] shadow-2xs cursor-pointer"
                  >
                    <option value="The Courtyard">The Sunlit Courtyard</option>
                    <option value="The Colonnade">The Colonnade Walk</option>
                    <option value="The Brew Bar">Brew Bar Counter</option>
                    <option value="The Listening Nook">Indoor Listening Nook</option>
                    <option value="Terrace Amphitheatre">Rooftop Amphitheatre</option>
                  </select>
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#292723] font-semibold mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Mehta"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs bg-white border border-[#C5B39A] rounded-xs px-3.5 py-2.5 text-[#1A1815] font-medium placeholder:text-[#70452D]/60 placeholder:font-normal focus:outline-hidden focus:border-[#873A35] focus:ring-1 focus:ring-[#873A35] shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#292723] font-semibold mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98000 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs font-mono bg-white border border-[#C5B39A] rounded-xs px-3.5 py-2.5 text-[#1A1815] font-medium placeholder:text-[#70452D]/60 placeholder:font-normal focus:outline-hidden focus:border-[#873A35] focus:ring-1 focus:ring-[#873A35] shadow-2xs"
                  />
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#292723] font-semibold mb-1.5">
                  Notes or Dietary Preferences (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Special occasion, dietary preferences, or quiet corner request..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full text-xs bg-white border border-[#C5B39A] rounded-xs p-3 text-[#1A1815] font-medium placeholder:text-[#70452D]/60 placeholder:font-normal focus:outline-hidden focus:border-[#873A35] focus:ring-1 focus:ring-[#873A35] shadow-2xs"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || availability?.isDateBlocked}
                  className="w-full bg-[#873A35] hover:bg-[#70452D] disabled:opacity-50 text-[#FFF3DF] text-xs font-semibold tracking-[0.2em] uppercase py-3.5 rounded-full transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Verifying Availability &amp; Booking...</span>
                    </>
                  ) : (
                    <span>Confirm Table Reservation</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#E8DDD0]/80 border-t border-[#DCCBB4] flex items-center justify-between text-[11px] font-mono text-[#523220] font-medium shrink-0">
          <span>{settings.hours || CAFE_DETAILS.hours}</span>
          <span>Thaltej, Ahmedabad</span>
        </div>

      </div>
    </div>
  );
};
