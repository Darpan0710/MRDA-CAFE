import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  MapPin,
  Users,
  RefreshCw,
  X,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { adminApi, EventItem } from '../../services/adminApi';

export const EventsManagement: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'Gathering',
    date: '',
    time: '',
    description: '',
    performers: '',
    venue: 'The Sunlit Courtyard, The Claywalls',
    published: true,
    posterImage: '/assets/aistudio/event-1_5eaf748b.jpg',
    spots: 'Open Entry from 4:00 PM',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getEvents();
      setEvents(res.events);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleTogglePublish = async (id: string) => {
    try {
      const res = await adminApi.togglePublish(id);
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? res.event : e))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to toggle publish status.');
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Event title is required.');
      return;
    }
    if (!formData.date.trim() || !formData.time.trim()) {
      setFormError('Date and time are required.');
      return;
    }

    try {
      setFormLoading(true);
      if (eventToEdit) {
        const res = await adminApi.updateEvent(eventToEdit.id, formData);
        setEvents((prev) =>
          prev.map((evt) => (evt.id === eventToEdit.id ? res.event : evt))
        );
        setEventToEdit(null);
      } else {
        const res = await adminApi.addEvent(formData);
        setEvents((prev) => [res.event, ...prev]);
        setAddModalOpen(false);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to save event.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      await adminApi.deleteEvent(eventToDelete.id);
      setEvents((prev) => prev.filter((e) => e.id !== eventToDelete.id));
      setEventToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete event.');
    }
  };

  const openEditModal = (evt: EventItem) => {
    setEventToEdit(evt);
    setFormData({
      title: evt.title,
      type: evt.type,
      date: evt.date,
      time: evt.time,
      description: evt.description,
      performers: evt.performers || '',
      venue: evt.venue,
      published: evt.published,
      posterImage: evt.posterImage || '/assets/aistudio/event-1_5eaf748b.jpg',
      spots: evt.spots || 'Open entry',
    });
  };

  const openAddModal = () => {
    setEventToEdit(null);
    setFormData({
      title: '',
      type: 'Tasting & Music',
      date: '',
      time: '',
      description: '',
      performers: '',
      venue: 'The Sunlit Courtyard, The Claywalls, Thaltej',
      published: true,
      posterImage: '/assets/aistudio/event-1_5eaf748b.jpg',
      spots: 'Open Entry',
    });
    setAddModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DCCBB4]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#873A35] uppercase tracking-widest mb-1">
            <span>COMMUNITY GATHERINGS</span>
            <span>✦</span>
            <span>LIVE LINEUPS</span>
          </div>
          <h1 className="font-editorial-display text-2xl sm:text-3xl text-[#292723] font-medium tracking-tight">
            Events &amp; Lineups Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 bg-[#873A35] text-[#FFF3DF] text-xs font-mono uppercase tracking-wider px-4 py-2.5 rounded-full hover:bg-[#70452D] transition-colors cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            <span>Create Event</span>
          </button>

          <button
            onClick={fetchEvents}
            title="Refresh Events"
            className="p-2.5 border border-[#DCCBB4] rounded-full text-[#70452D] hover:bg-white transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw size={24} className="text-[#873A35] animate-spin mx-auto" />
          <p className="text-xs font-mono uppercase tracking-widest text-[#70452D]">
            Loading events from database...
          </p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-[#FFF3DF] border border-[#DCCBB4] p-16 text-center space-y-3 rounded-xs">
          <Sparkles size={36} className="text-[#70452D]/40 mx-auto" />
          <h3 className="font-editorial-display text-xl text-[#292723]">No Events Stored</h3>
          <p className="text-xs text-[#70452D] font-light max-w-sm mx-auto">
            Create an event to display on the public website and homepage event preview.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Poster & Status Header */}
                <div className="relative aspect-[16/9] bg-[#1D3244] overflow-hidden">
                  <img
                    src={evt.posterImage || '/assets/aistudio/event-1_5eaf748b.jpg'}
                    alt={evt.title}
                    className="w-full h-full object-cover object-top opacity-85"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/aistudio/event-1_5eaf748b.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-xs text-[#FFF3DF] rounded text-[10px] font-mono tracking-wider uppercase">
                      {evt.type}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-wider uppercase font-semibold ${
                        evt.published
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      {evt.published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-[#FFF3DF]">
                    <div className="text-[11px] font-mono text-[#FFF3DF]/80">
                      {evt.date} · {evt.time}
                    </div>
                    <h3 className="font-editorial-display text-lg font-medium leading-snug truncate">
                      {evt.title}
                    </h3>
                  </div>
                </div>

                {/* Details Content */}
                <div className="p-5 space-y-3 text-xs font-sans">
                  {evt.performers && (
                    <div className="flex items-center gap-2 text-xs font-medium text-[#873A35]">
                      <span className="font-mono text-[10px] uppercase text-[#70452D]">Lineup:</span>
                      <span>{evt.performers}</span>
                    </div>
                  )}

                  <p className="text-xs text-[#70452D] line-clamp-3 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-[#70452D]/80 border-t border-[#DCCBB4]/60 pt-2">
                    <span>Venue: {evt.venue}</span>
                    <span>{evt.spots || 'Open'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 bg-[#F1E9DC]/60 border-t border-[#DCCBB4] flex items-center justify-between">
                <button
                  onClick={() => handleTogglePublish(evt.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
                    evt.published
                      ? 'bg-white border-[#DCCBB4] text-[#70452D] hover:bg-amber-50 hover:text-amber-800'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  {evt.published ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{evt.published ? 'Unpublish' : 'Publish'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(evt)}
                    className="p-1.5 text-[#70452D] hover:text-[#292723] rounded hover:bg-white transition-colors cursor-pointer"
                    title="Edit Event"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => setEventToDelete(evt)}
                    className="p-1.5 text-[#70452D] hover:text-red-700 rounded hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete Event"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= CREATE / EDIT EVENT MODAL ================= */}
      {(addModalOpen || eventToEdit) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#DCCBB4]">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#873A35] font-semibold block">
                  {eventToEdit ? 'EDIT EVENT LINEUP' : 'NEW GATHERING'}
                </span>
                <h3 className="font-editorial-display text-2xl font-medium text-[#292723]">
                  {eventToEdit ? 'Update Event Details' : 'Create Event Record'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setAddModalOpen(false);
                  setEventToEdit(null);
                }}
                className="p-1.5 text-[#70452D] hover:text-[#292723] rounded-full hover:bg-[#DCCBB4]/40 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xs text-xs text-red-800 flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-700" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekender at MRDĀ — Day 1: Caffeinia & DJ Set"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Date *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026-10-31 or Alternate Saturdays"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4:00 PM – 9:30 PM"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Event Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tasting & Music, Dialogue, Workshop"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Capacity / Spots
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Open Entry from 4:00 PM or 10 spots"
                    value={formData.spots}
                    onChange={(e) => setFormData({ ...formData, spots: e.target.value })}
                    className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                  Performers / Speakers / Hosts
                </label>
                <input
                  type="text"
                  placeholder="e.g. Binny Varghese, Kadaknath B2B Add A White Petal"
                  value={formData.performers}
                  onChange={(e) => setFormData({ ...formData, performers: e.target.value })}
                  className="w-full bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                  Venue / Location inside MRDĀ
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Sunlit Courtyard & Colonnade, The Claywalls"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                  Poster Image Path / URL
                </label>
                <select
                  value={formData.posterImage}
                  onChange={(e) => setFormData({ ...formData, posterImage: e.target.value })}
                  className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                >
                  <option value="/assets/aistudio/event-2_d4128536.jpg">Day 1 Lineup Poster (event-2)</option>
                  <option value="/assets/aistudio/event-3_dfd9a2cc.jpg">Day 2 Lineup Poster (event-3)</option>
                  <option value="/assets/aistudio/event-1_5eaf748b.jpg">General Weekender Teaser Poster (event-1)</option>
                  <option value="/MDRA/images/cafe/cafe-6.jpg">Listening Nook Vinyl Corner</option>
                  <option value="/MDRA/images/cafe/cafe-3.jpg">Brew Bar Sandstone Counter</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                  Description / Editorial Copy
                </label>
                <textarea
                  rows={3}
                  placeholder="Narrative description of the gathering..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border border-[#DCCBB4] rounded-xs p-2.5 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="eventPublishedCheck"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="rounded text-[#873A35] focus:ring-[#873A35] cursor-pointer"
                />
                <label htmlFor="eventPublishedCheck" className="text-xs text-[#292723] font-medium cursor-pointer">
                  Publish to Customer Website &amp; Homepage Events
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#DCCBB4]">
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setEventToEdit(null);
                  }}
                  className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#70452D] hover:text-[#292723] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 bg-[#873A35] hover:bg-[#70452D] text-[#FFF3DF] text-xs font-mono uppercase tracking-wider rounded-full transition-colors cursor-pointer shadow-xs"
                >
                  {formLoading ? 'Saving...' : 'Save Event'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION DIALOG ================= */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-editorial-sans text-xl font-medium text-[#292723]">
              Confirm Event Deletion
            </h3>
            <p className="text-xs text-[#70452D] leading-relaxed">
              Are you sure you want to remove <strong className="text-[#292723]">{eventToDelete.title}</strong>? It will no longer appear on public pages.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEventToDelete(null)}
                className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#70452D] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEvent}
                className="px-5 py-2 text-xs font-mono uppercase tracking-wider bg-red-800 text-white hover:bg-red-900 rounded-full cursor-pointer"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
