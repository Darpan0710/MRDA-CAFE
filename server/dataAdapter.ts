import { isSupabaseConfigured } from './supabaseClient';
import { supabaseDb } from './supabaseDb';
import {
  db as localDb,
  MenuItemRecord,
  EventRecord,
  CafeSettings,
  Reservation,
  BlockedSlot,
  BlockedDate,
  AuditLogRecord,
  AdminUser,
  Session,
} from './db';

/**
 * Unified Data Adapter
 *
 * Rules:
 * 1. When Supabase is configured (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are present),
 *    all operations are executed against the live Supabase PostgreSQL database.
 * 2. If a live Supabase operation fails, it throws the database error rather than silently
 *    falling back to local memory, ensuring data integrity and visible error states.
 * 3. Local JSON fallback is used ONLY when Supabase credentials are not configured.
 */
export const dataAdapter = {
  isUsingSupabase(): boolean {
    return isSupabaseConfigured();
  },

  // ==================== SETTINGS ====================
  async getSettings(): Promise<CafeSettings> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.getSettings();
    }
    return localDb.getSettings();
  },

  async updateSettings(settings: Partial<CafeSettings>): Promise<CafeSettings> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.updateSettings(settings);
    }
    return localDb.updateSettings(settings);
  },

  // ==================== MENU ITEMS ====================
  async getMenuItems(): Promise<MenuItemRecord[]> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.getMenuItems();
    }
    return localDb.getMenuItems();
  },

  async getMenuItemById(id: string): Promise<MenuItemRecord | null> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.getMenuItemById(id);
    }
    return localDb.getMenuItems().find((i) => i.id === id) || null;
  },

  async addMenuItem(item: Omit<MenuItemRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItemRecord> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.addMenuItem(item);
    }
    return localDb.addMenuItem(item);
  },

  async updateMenuItem(
    id: string,
    updates: Partial<Omit<MenuItemRecord, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<MenuItemRecord | null> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.updateMenuItem(id, updates);
    }
    return localDb.updateMenuItem(id, updates);
  },

  async toggleMenuItemStock(id: string): Promise<MenuItemRecord | null> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.toggleMenuItemStock(id);
    }
    return localDb.toggleItemStock(id);
  },

  async toggleItemStock(id: string): Promise<MenuItemRecord | null> {
    return this.toggleMenuItemStock(id);
  },

  async deleteMenuItem(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.deleteMenuItem(id);
    }
    return localDb.deleteMenuItem(id);
  },

  // ==================== EVENTS ====================
  async getEvents(publishedOnly?: boolean): Promise<EventRecord[]> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.getEvents(publishedOnly);
    }
    return localDb.getEvents(publishedOnly);
  },

  async getEventById(id: string): Promise<EventRecord | null> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.getEventById(id);
    }
    return localDb.getEvents(false).find((e) => e.id === id) || null;
  },

  async addEvent(event: Omit<EventRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<EventRecord> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.addEvent(event);
    }
    return localDb.addEvent(event);
  },

  async updateEvent(
    id: string,
    updates: Partial<Omit<EventRecord, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<EventRecord | null> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.updateEvent(id, updates);
    }
    return localDb.updateEvent(id, updates);
  },

  async toggleEventPublish(id: string): Promise<EventRecord | null> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.toggleEventPublish(id);
    }
    return localDb.toggleEventPublish(id);
  },

  async deleteEvent(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.deleteEvent(id);
    }
    return localDb.deleteEvent(id);
  },

  // ==================== RESERVATIONS ====================
  async getReservations(): Promise<Reservation[]> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.getReservations();
    }
    return localDb.getReservations();
  },

  async getReservationById(id: string): Promise<Reservation | null> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.getReservationById(id);
    }
    return localDb.getReservationById(id);
  },

  async addReservation(res: Omit<Reservation, 'id' | 'reference' | 'createdAt' | 'updatedAt'>): Promise<Reservation> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.addReservation(res);
    }
    return localDb.addReservation(res);
  },

  async updateReservation(
    id: string,
    updates: Partial<Omit<Reservation, 'id' | 'reference' | 'createdAt'>>
  ): Promise<Reservation | null> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.updateReservation(id, updates);
    }
    return localDb.updateReservation(id, updates);
  },

  async updateReservationStatus(id: string, status: Reservation['status']): Promise<Reservation | null> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.updateReservationStatus(id, status);
    }
    return localDb.updateReservationStatus(id, status);
  },

  async deleteReservation(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.deleteReservation(id);
    }
    return localDb.deleteReservation(id);
  },

  // ==================== BLOCKED DATES & SLOTS ====================
  async getBlockedSlots(): Promise<BlockedSlot[]> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.getBlockedSlots();
    }
    return localDb.getBlockedSlots();
  },

  async blockSlot(date: string, time: string, reason?: string): Promise<BlockedSlot> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.blockSlot(date, time, reason);
    }
    return localDb.blockSlot(date, time, reason);
  },

  async unblockSlot(date: string, time: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.unblockSlot(date, time);
    }
    return localDb.unblockSlot(date, time);
  },

  async getBlockedDates(): Promise<BlockedDate[]> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.getBlockedDates();
    }
    return localDb.getBlockedDates();
  },

  async blockDate(date: string, reason?: string): Promise<BlockedDate> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.blockDate(date, reason);
    }
    return localDb.blockDate(date, reason);
  },

  async unblockDate(date: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.unblockDate(date);
    }
    return localDb.unblockDate(date);
  },

  // ==================== AUDIT LOGS ====================
  async getAuditLogs(limit = 50): Promise<AuditLogRecord[]> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.getAuditLogs(limit);
    }
    return localDb.getAuditLogs(limit);
  },

  async logAudit(log: Omit<AuditLogRecord, 'id' | 'timestamp'>): Promise<AuditLogRecord> {
    if (isSupabaseConfigured()) {
      return await supabaseDb.logAudit(log);
    }
    return localDb.logAudit(log);
  },

  // ==================== ADMIN PROFILES & SESSIONS ====================
  async getAdminUsers(): Promise<AdminUser[]> {
    if (isSupabaseConfigured()) {
      const profiles = await supabaseDb.getAdminProfiles();
      const localAdmins = localDb.getAdminUsers();
      return profiles.map((p) => {
        const local = localAdmins.find((la) => la.id === p.id || la.email === p.email);
        return {
          ...p,
          passwordHash: local ? local.passwordHash : '',
          salt: local ? local.salt : '',
        };
      });
    }
    return localDb.getAdminUsers();
  },

  async getAdminUserById(id: string): Promise<AdminUser | null> {
    return localDb.findAdminById(id) || localDb.getAdminUsers().find((u) => u.id === id) || null;
  },

  findAdminById(id: string): AdminUser | null {
    return localDb.findAdminById(id);
  },

  getAdmin(): AdminUser {
    return localDb.getAdmin();
  },

  async findAdminByEmailOrUsername(identifier: string): Promise<AdminUser | null> {
    return localDb.findAdminByEmailOrUsername(identifier);
  },

  async updateAdmin(id: string, updates: Partial<AdminUser>): Promise<AdminUser | null> {
    if (isSupabaseConfigured()) {
      if (updates.lastLoginAt) {
        await supabaseDb.updateAdminLastLogin(id);
      }
      if (updates.email || updates.name || updates.username) {
        await supabaseDb.updateAdminProfile(id, {
          email: updates.email,
          name: updates.name,
          username: updates.username,
        });
      }
    }
    return localDb.updateAdmin(id, updates);
  },

  createSession(userId: string): Session {
    return localDb.createSession(userId);
  },

  getSession(token: string): Session | null {
    return localDb.getSession(token);
  },

  deleteSession(token: string): boolean {
    localDb.deleteSession(token);
    return true;
  },

  invalidateAdminSessions(userId: string): void {
    localDb.invalidateAdminSessions(userId);
  },

  syncAdminCredentialsFromEnv() {
    return localDb.syncAdminCredentialsFromEnv();
  },
};
