/**
 * Public client API service for customer-facing interactions
 * Directly talks to backend /api/* routes
 */

export interface PublicReservationPayload {
  name: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  guests: string;
  zone: string;
  notes?: string;
}

export interface PublicReservationResult {
  success: boolean;
  reservation: {
    id: string;
    reference: string;
    name: string;
    phone: string;
    email?: string;
    date: string;
    time: string;
    guests: string;
    zone: string;
    notes?: string;
    status: string;
    createdAt: string;
  };
  message: string;
}

export interface AvailabilityResult {
  date: string;
  isDateBlocked: boolean;
  isDatePast?: boolean;
  timeSlots: string[];
  blockedSlots: string[];
  elapsedSlots?: string[];
  availableSlots: string[];
  slotBookingCounts: Record<string, number>;
  defaultCapacity: number;
}

export const publicApi = {
  // Check available slots for selected date
  async checkAvailability(date: string): Promise<AvailabilityResult> {
    const res = await fetch(`/api/availability?date=${encodeURIComponent(date)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to check availability');
    }
    return res.json();
  },

  // Submit reservation request
  async submitReservation(payload: PublicReservationPayload): Promise<PublicReservationResult> {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit reservation');
    }

    return data;
  },

  // Fetch live menu items
  async fetchMenu() {
    const res = await fetch('/api/menu');
    if (!res.ok) throw new Error('Failed to load menu');
    return res.json();
  },

  // Fetch live events
  async fetchEvents() {
    const res = await fetch('/api/events');
    if (!res.ok) throw new Error('Failed to load events');
    return res.json();
  },

  // Fetch safe public café settings
  async fetchSettings() {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to load café settings');
    return res.json();
  },
};
