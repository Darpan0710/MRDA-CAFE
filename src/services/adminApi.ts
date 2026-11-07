/**
 * Admin API service for MRDĀ Management Console
 * Interacts with server-authenticated /api/admin/* endpoints
 */

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  lastLoginAt?: string;
}

export interface DashboardMetrics {
  totalReservations: number;
  todayReservations: number;
  upcomingReservations: number;
  pendingReservations?: number;
  blockedSlotsCount: number;
  blockedDatesCount: number;
  outOfStockCount: number;
  upcomingEventsCount: number;
}

export interface Reservation {
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
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface BlockedSlot {
  date: string;
  time: string;
  reason?: string;
  createdAt: string;
}

export interface BlockedDate {
  date: string;
  reason?: string;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number | string;
  description?: string;
  tag?: 'Caffeinated' | 'Non-Caffeinated' | 'Vegan' | 'Vegetarian' | 'Specialty';
  categoryId: string;
  categoryTitle: string;
  menuType: 'poured' | 'plated';
  inStock: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  description: string;
  performers?: string;
  venue: string;
  published: boolean;
  posterImage?: string;
  spots?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CafeSettings {
  cafeName: string;
  address: string;
  phone: string;
  hours: string;
  bookingCutoffHours: number;
  maxPartySize: number;
  defaultSlotCapacity: number;
  autoConfirmReservations: boolean;
  timeSlots: string[];
}

const TOKEN_KEY = 'mrda_admin_token';
const USER_KEY = 'mrda_admin_user';

export const adminAuth = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string, user: AdminUser): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearToken(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  getUser(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = adminAuth.getToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      adminAuth.clearToken();
      // Only reload or redirect if inside admin
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        window.dispatchEvent(new CustomEvent('mrda:admin:unauthorized'));
      }
    }
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const adminApi = {
  // Auth
  async login(identifier: string, password: string): Promise<{ token: string; user: AdminUser }> {
    const res = await apiRequest<{ token: string; user: AdminUser }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    adminAuth.setToken(res.token, res.user);
    return res;
  },

  async logout(): Promise<void> {
    try {
      await apiRequest('/api/admin/logout', { method: 'POST' });
    } finally {
      adminAuth.clearToken();
    }
  },

  async getMe(): Promise<{ user: AdminUser }> {
    return apiRequest<{ user: AdminUser }>('/api/admin/me');
  },

  // Dashboard
  async getDashboard(): Promise<{
    metrics: DashboardMetrics;
    recentReservations: Reservation[];
    blockedSlotsPreview: BlockedSlot[];
    outOfStockPreview: MenuItem[];
    upcomingEventsPreview: EventItem[];
  }> {
    return apiRequest('/api/admin/dashboard');
  },

  // Reservations
  async getReservations(filters?: {
    date?: string;
    status?: string;
    search?: string;
  }): Promise<{ reservations: Reservation[]; count: number }> {
    const params = new URLSearchParams();
    if (filters?.date) params.set('date', filters.date);
    if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters?.search) params.set('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/api/admin/reservations${query}`);
  },

  async updateReservationStatus(
    id: string,
    status: Reservation['status']
  ): Promise<{ success: boolean; reservation: Reservation }> {
    return apiRequest(`/api/admin/reservations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async updateReservation(
    id: string,
    updates: Partial<Omit<Reservation, 'id' | 'reference' | 'createdAt'>>
  ): Promise<{ success: boolean; reservation: Reservation; message: string }> {
    return apiRequest(`/api/admin/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async createAdminReservation(payload: {
    name: string;
    phone: string;
    email?: string;
    date: string;
    time: string;
    guests: string;
    zone: string;
    notes?: string;
    status?: Reservation['status'];
    isOverride?: boolean;
    overrideReason?: string;
  }): Promise<{ success: boolean; reservation: Reservation; message: string }> {
    return apiRequest('/api/admin/reservations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async checkDuplicateReservation(
    phone: string,
    date: string
  ): Promise<{ isDuplicate: boolean; count: number; matches?: Reservation[] }> {
    const params = new URLSearchParams({ phone, date });
    return apiRequest(`/api/admin/reservations/check-duplicate?${params.toString()}`);
  },

  async getAuditLogs(): Promise<{
    auditLogs: {
      id: string;
      action: string;
      adminName: string;
      timestamp: string;
      details: string;
      overrideReason?: string;
    }[];
  }> {
    return apiRequest('/api/admin/audit-logs');
  },

  async cancelReservation(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/api/admin/reservations/${id}`, {
      method: 'DELETE',
    });
  },

  // Availability
  async getAvailability(): Promise<{
    blockedDates: BlockedDate[];
    blockedSlots: BlockedSlot[];
    timeSlots: string[];
    defaultCapacity: number;
  }> {
    return apiRequest('/api/admin/availability');
  },

  async blockSlot(
    date: string,
    time: string,
    reason?: string
  ): Promise<{ success: boolean; slot: BlockedSlot }> {
    return apiRequest('/api/admin/availability/block-slot', {
      method: 'POST',
      body: JSON.stringify({ date, time, reason }),
    });
  },

  async unblockSlot(date: string, time: string): Promise<{ success: boolean }> {
    return apiRequest('/api/admin/availability/unblock-slot', {
      method: 'POST',
      body: JSON.stringify({ date, time }),
    });
  },

  async blockDate(date: string, reason?: string): Promise<{ success: boolean; blocked: BlockedDate }> {
    return apiRequest('/api/admin/availability/block-date', {
      method: 'POST',
      body: JSON.stringify({ date, reason }),
    });
  },

  async unblockDate(date: string): Promise<{ success: boolean }> {
    return apiRequest('/api/admin/availability/unblock-date', {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  },

  // Menu Management
  async getMenuItems(): Promise<{ items: MenuItem[] }> {
    return apiRequest('/api/admin/menu');
  },

  async addMenuItem(item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; item: MenuItem }> {
    return apiRequest('/api/admin/menu/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  async updateMenuItem(
    id: string,
    updates: Partial<Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<{ success: boolean; item: MenuItem }> {
    return apiRequest(`/api/admin/menu/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async toggleStock(id: string): Promise<{ success: boolean; item: MenuItem }> {
    return apiRequest(`/api/admin/menu/items/${id}/stock`, {
      method: 'PATCH',
    });
  },

  async deleteMenuItem(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/api/admin/menu/items/${id}`, {
      method: 'DELETE',
    });
  },

  // Events Management
  async getEvents(): Promise<{ events: EventItem[] }> {
    return apiRequest('/api/admin/events');
  },

  async addEvent(
    event: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; event: EventItem }> {
    return apiRequest('/api/admin/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },

  async updateEvent(
    id: string,
    updates: Partial<Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<{ success: boolean; event: EventItem }> {
    return apiRequest(`/api/admin/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async togglePublish(id: string): Promise<{ success: boolean; event: EventItem }> {
    return apiRequest(`/api/admin/events/${id}/publish`, {
      method: 'PATCH',
    });
  },

  async deleteEvent(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/api/admin/events/${id}`, {
      method: 'DELETE',
    });
  },

  // Settings
  async getSettings(): Promise<{
    settings: CafeSettings;
    adminProfile: AdminUser;
    adminAccounts?: Array<{
      id: string;
      username: string;
      email: string;
      name: string;
      lastLoginAt?: string;
      role: string;
    }>;
  }> {
    return apiRequest('/api/admin/settings');
  },

  async updateSettings(settings: Partial<CafeSettings>): Promise<{ success: boolean; settings: CafeSettings }> {
    return apiRequest('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  async updateCredentials(params: {
    currentPassword: string;
    targetAdminId?: string;
    newUsername?: string;
    newEmail?: string;
    newPassword?: string;
    newName?: string;
  }): Promise<{ success: boolean; message: string; adminProfile: AdminUser; newToken?: string }> {
    const res = await apiRequest<{
      success: boolean;
      message: string;
      adminProfile: AdminUser;
      newToken?: string;
    }>('/api/admin/settings/credentials', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    // Update cached token and profile if caller updated their own account
    const activeToken = res.newToken || adminAuth.getToken();
    const currentUser = adminAuth.getUser();
    if (activeToken && res.adminProfile && (!params.targetAdminId || params.targetAdminId === currentUser?.id)) {
      adminAuth.setToken(activeToken, res.adminProfile);
    }
    return res;
  },
};
