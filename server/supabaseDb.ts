import { getSupabaseAdminClient } from './supabaseClient';
import {
  MenuItemRecord,
  EventRecord,
  CafeSettings,
  Reservation,
  BlockedSlot,
  BlockedDate,
  AuditLogRecord,
  AdminUser,
} from './db';

// Transformers between PostgreSQL snake_case and TypeScript camelCase

function mapMenuItemFromDb(row: any): MenuItemRecord {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    description: row.description || undefined,
    tag: row.tag || undefined,
    categoryId: row.category_id,
    categoryTitle: row.category_title,
    menuType: row.menu_type,
    inStock: Boolean(row.in_stock),
    image: row.image || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapEventFromDb(row: any): EventRecord {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    date: row.date,
    time: row.time,
    description: row.description,
    performers: row.performers || undefined,
    venue: row.venue || 'MRDĀ, 6th Floor, Claywalls, Ahmedabad',
    published: Boolean(row.published),
    posterImage: row.poster_image || undefined,
    spots: row.spots || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapReservationFromDb(row: any): Reservation {
  return {
    id: row.id,
    reference: row.reference,
    name: row.name,
    phone: row.phone,
    email: row.email || undefined,
    date: row.date,
    time: row.time,
    guests: String(row.guests),
    zone: row.zone,
    notes: row.notes || undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSettingsFromDb(row: any): CafeSettings {
  return {
    cafeName: row.cafe_name,
    address: row.address,
    phone: row.phone,
    hours: row.hours,
    bookingCutoffHours: Number(row.booking_cutoff_hours) || 2,
    maxPartySize: Number(row.max_party_size) || 12,
    defaultSlotCapacity: Number(row.default_slot_capacity) || 20,
    autoConfirmReservations: Boolean(row.auto_confirm_reservations),
    timeSlots: Array.isArray(row.time_slots) ? row.time_slots : [],
  };
}

function mapAuditLogFromDb(row: any): AuditLogRecord {
  return {
    id: row.id,
    action: row.action,
    adminId: row.admin_id,
    adminName: row.admin_name,
    timestamp: row.timestamp,
    details: row.details,
    affectedId: row.affected_id || undefined,
    overrideReason: row.override_reason || undefined,
  };
}

export const supabaseDb = {
  // ===================== MENU ITEMS =====================
  async getMenuItems(): Promise<MenuItemRecord[]> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const { data, error } = await client
      .from('menu_items')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapMenuItemFromDb);
  },

  async getMenuItemById(id: string): Promise<MenuItemRecord | null> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const { data, error } = await client
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapMenuItemFromDb(data) : null;
  },

  async addMenuItem(item: Omit<MenuItemRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItemRecord> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const id = `menu-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const payload = {
      id,
      name: item.name.trim(),
      price: String(item.price),
      description: item.description?.trim() || null,
      tag: item.tag || null,
      category_id: item.categoryId,
      category_title: item.categoryTitle,
      menu_type: item.menuType,
      in_stock: item.inStock !== false,
      image: item.image || null,
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await client
      .from('menu_items')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return mapMenuItemFromDb(data);
  },

  async updateMenuItem(
    id: string,
    updates: Partial<Omit<MenuItemRecord, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<MenuItemRecord | null> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = updates.name.trim();
    if (updates.price !== undefined) payload.price = String(updates.price);
    if (updates.description !== undefined) payload.description = updates.description.trim() || null;
    if (updates.tag !== undefined) payload.tag = updates.tag || null;
    if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
    if (updates.categoryTitle !== undefined) payload.category_title = updates.categoryTitle;
    if (updates.menuType !== undefined) payload.menu_type = updates.menuType;
    if (updates.inStock !== undefined) payload.in_stock = updates.inStock;
    if (updates.image !== undefined) payload.image = updates.image || null;

    const { data, error } = await client
      .from('menu_items')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data ? mapMenuItemFromDb(data) : null;
  },

  async toggleMenuItemStock(id: string): Promise<MenuItemRecord | null> {
    const current = await this.getMenuItemById(id);
    if (!current) return null;
    return this.updateMenuItem(id, { inStock: !current.inStock });
  },

  async toggleItemStock(id: string): Promise<MenuItemRecord | null> {
    return this.toggleMenuItemStock(id);
  },

  async deleteMenuItem(id: string): Promise<boolean> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const { error } = await client.from('menu_items').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // ===================== EVENTS =====================
  async getEvents(publishedOnly = false): Promise<EventRecord[]> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    let query = client
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    if (publishedOnly) {
      query = query.eq('published', true);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapEventFromDb);
  },

  async getEventById(id: string): Promise<EventRecord | null> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const { data, error } = await client
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapEventFromDb(data) : null;
  },

  async addEvent(event: Omit<EventRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<EventRecord> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const id = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const payload = {
      id,
      title: event.title.trim(),
      type: event.type.trim(),
      date: event.date.trim(),
      time: event.time.trim(),
      description: event.description.trim(),
      performers: event.performers?.trim() || null,
      venue: event.venue?.trim() || 'MRDĀ, 6th Floor, Claywalls, Ahmedabad',
      published: event.published !== false,
      poster_image: event.posterImage || null,
      spots: event.spots?.trim() || null,
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await client
      .from('events')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return mapEventFromDb(data);
  },

  async updateEvent(
    id: string,
    updates: Partial<Omit<EventRecord, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<EventRecord | null> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) payload.title = updates.title.trim();
    if (updates.type !== undefined) payload.type = updates.type.trim();
    if (updates.date !== undefined) payload.date = updates.date.trim();
    if (updates.time !== undefined) payload.time = updates.time.trim();
    if (updates.description !== undefined) payload.description = updates.description.trim();
    if (updates.performers !== undefined) payload.performers = updates.performers?.trim() || null;
    if (updates.venue !== undefined) payload.venue = updates.venue.trim();
    if (updates.published !== undefined) payload.published = updates.published;
    if (updates.posterImage !== undefined) payload.poster_image = updates.posterImage || null;
    if (updates.spots !== undefined) payload.spots = updates.spots?.trim() || null;

    const { data, error } = await client
      .from('events')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data ? mapEventFromDb(data) : null;
  },

  async toggleEventPublish(id: string): Promise<EventRecord | null> {
    const current = await this.getEventById(id);
    if (!current) return null;
    return this.updateEvent(id, { published: !current.published });
  },

  async deleteEvent(id: string): Promise<boolean> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const { error } = await client.from('events').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // ===================== CAFE SETTINGS =====================
  async getSettings(): Promise<CafeSettings> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const { data, error } = await client
      .from('cafe_settings')
      .select('*')
      .eq('id', 'current')
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return {
        cafeName: 'MRDĀ',
        address: '6th Floor, Claywalls, Zydus Hospital Road, Opposite Verantes, Thaltej, Ahmedabad, Gujarat 380059, India',
        phone: '+91 87996 00369',
        hours: 'Mon - Sun | 8:00 AM - 10:00 PM',
        bookingCutoffHours: 2,
        maxPartySize: 12,
        defaultSlotCapacity: 20,
        autoConfirmReservations: true,
        timeSlots: ['10:00 AM', '12:00 PM', '2:00 PM', '4:30 PM', '6:30 PM', '8:00 PM'],
      };
    }
    return mapSettingsFromDb(data);
  },

  async updateSettings(settings: Partial<CafeSettings>): Promise<CafeSettings> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const payload: any = { updated_at: new Date().toISOString() };
    if (settings.cafeName !== undefined) payload.cafe_name = settings.cafeName;
    if (settings.address !== undefined) payload.address = settings.address;
    if (settings.phone !== undefined) payload.phone = settings.phone;
    if (settings.hours !== undefined) payload.hours = settings.hours;
    if (settings.bookingCutoffHours !== undefined) payload.booking_cutoff_hours = settings.bookingCutoffHours;
    if (settings.maxPartySize !== undefined) payload.max_party_size = settings.maxPartySize;
    if (settings.defaultSlotCapacity !== undefined) payload.default_slot_capacity = settings.defaultSlotCapacity;
    if (settings.autoConfirmReservations !== undefined) payload.auto_confirm_reservations = settings.autoConfirmReservations;
    if (settings.timeSlots !== undefined) payload.time_slots = settings.timeSlots;

    const { data, error } = await client
      .from('cafe_settings')
      .upsert({ id: 'current', ...payload })
      .select()
      .single();
    if (error) throw error;
    return mapSettingsFromDb(data);
  },

  // ===================== RESERVATIONS =====================
  async getReservations(): Promise<Reservation[]> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const { data, error } = await client
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapReservationFromDb);
  },

  async getReservationById(id: string): Promise<Reservation | null> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const { data, error } = await client
      .from('reservations')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapReservationFromDb(data) : null;
  },

  async addReservation(res: Omit<Reservation, 'id' | 'reference' | 'createdAt' | 'updatedAt'>): Promise<Reservation> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const reference = `MRD-${rand}`;
    const id = `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const payload = {
      id,
      reference,
      name: res.name.trim(),
      phone: res.phone.trim(),
      email: res.email?.trim() || null,
      date: res.date,
      time: res.time,
      guests: String(res.guests),
      zone: res.zone,
      notes: res.notes?.trim() || null,
      status: res.status || 'confirmed',
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await client
      .from('reservations')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return mapReservationFromDb(data);
  },

  async updateReservation(
    id: string,
    updates: Partial<Omit<Reservation, 'id' | 'reference' | 'createdAt'>>
  ): Promise<Reservation | null> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = updates.name.trim();
    if (updates.phone !== undefined) payload.phone = updates.phone.trim();
    if (updates.email !== undefined) payload.email = updates.email?.trim() || null;
    if (updates.date !== undefined) payload.date = updates.date;
    if (updates.time !== undefined) payload.time = updates.time;
    if (updates.guests !== undefined) payload.guests = String(updates.guests);
    if (updates.zone !== undefined) payload.zone = updates.zone;
    if (updates.notes !== undefined) payload.notes = updates.notes?.trim() || null;
    if (updates.status !== undefined) payload.status = updates.status;

    const { data, error } = await client
      .from('reservations')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data ? mapReservationFromDb(data) : null;
  },

  async updateReservationStatus(id: string, status: Reservation['status']): Promise<Reservation | null> {
    return this.updateReservation(id, { status });
  },

  async deleteReservation(id: string): Promise<boolean> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const { error } = await client.from('reservations').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // ===================== BLOCKED SLOTS & DATES =====================
  async getBlockedSlots(): Promise<BlockedSlot[]> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const { data, error } = await client.from('blocked_slots').select('*');
    if (error) throw error;
    return (data || []).map((row) => ({
      date: row.date,
      time: row.time,
      reason: row.reason || undefined,
      createdAt: row.created_at,
    }));
  },

  async blockSlot(date: string, time: string, reason?: string): Promise<BlockedSlot> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const now = new Date().toISOString();
    const payload = {
      date,
      time,
      reason: reason || null,
      created_at: now,
    };
    const { data, error } = await client
      .from('blocked_slots')
      .upsert(payload, { onConflict: 'date,time' })
      .select()
      .single();
    if (error) throw error;
    return {
      date: data.date,
      time: data.time,
      reason: data.reason || undefined,
      createdAt: data.created_at,
    };
  },

  async unblockSlot(date: string, time: string): Promise<boolean> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const { error } = await client
      .from('blocked_slots')
      .delete()
      .match({ date, time });
    if (error) throw error;
    return true;
  },

  async getBlockedDates(): Promise<BlockedDate[]> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const { data, error } = await client.from('blocked_dates').select('*');
    if (error) throw error;
    return (data || []).map((row) => ({
      date: row.date,
      reason: row.reason || undefined,
      createdAt: row.created_at,
    }));
  },

  async blockDate(date: string, reason?: string): Promise<BlockedDate> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const now = new Date().toISOString();
    const payload = {
      date,
      reason: reason || null,
      created_at: now,
    };
    const { data, error } = await client
      .from('blocked_dates')
      .upsert(payload, { onConflict: 'date' })
      .select()
      .single();
    if (error) throw error;
    return {
      date: data.date,
      reason: data.reason || undefined,
      createdAt: data.created_at,
    };
  },

  async unblockDate(date: string): Promise<boolean> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const { error } = await client.from('blocked_dates').delete().eq('date', date);
    if (error) throw error;
    return true;
  },

  // ===================== AUDIT LOGS =====================
  async getAuditLogs(limit = 50): Promise<AuditLogRecord[]> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const { data, error } = await client
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map(mapAuditLogFromDb);
  },

  async logAudit(log: Omit<AuditLogRecord, 'id' | 'timestamp'>): Promise<AuditLogRecord> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const id = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const timestamp = new Date().toISOString();
    const payload = {
      id,
      action: log.action,
      admin_id: log.adminId,
      admin_name: log.adminName,
      timestamp,
      details: log.details,
      affected_id: log.affectedId || null,
      override_reason: log.overrideReason || null,
    };
    const { data, error } = await client
      .from('audit_logs')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return mapAuditLogFromDb(data);
  },

  // ===================== ADMIN PROFILES (2 Active Accounts: admin-1, admin-2) =====================
  async getAdminProfiles(): Promise<AdminUser[]> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const { data, error } = await client
      .from('admin_profiles')
      .select('*')
      .in('id', ['admin-1', 'admin-2']);
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      username: row.username,
      email: row.email,
      name: row.name,
      passwordHash: '',
      salt: '',
      lastLoginAt: row.last_login_at || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async updateAdminLastLogin(id: string): Promise<void> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const { error } = await client
      .from('admin_profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async updateAdminProfile(
    id: string,
    updates: { email?: string; name?: string; username?: string }
  ): Promise<void> {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Supabase client not configured.');
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.email !== undefined) payload.email = updates.email.trim().toLowerCase();
    if (updates.name !== undefined) payload.name = updates.name.trim();
    if (updates.username !== undefined) payload.username = updates.username.trim();

    const { error } = await client
      .from('admin_profiles')
      .update(payload)
      .eq('id', id);
    if (error) throw error;
  },
};
