import { Router, Request, Response } from 'express';
import { generateSalt, hashPassword, getSecretFingerprint } from './db';
import { dataAdapter as db } from './dataAdapter';
import { requireAdminAuth, verifyPassword, AuthenticatedRequest } from './auth';
import {
  ALLOWED_TIME_SLOTS,
  isSlotWithinAllowedHours,
  isSlotElapsedIST,
  isDateInPastIST,
  getTodayDateStringIST,
  parse12HourTime,
  isEventPastIST,
} from './dateUtils';

export const apiRouter = Router();

// Automatically forward async errors in Express 4 routes to centralized error handler
const routerMethods = ['get', 'post', 'put', 'patch', 'delete'] as const;
for (const method of routerMethods) {
  const orig = (apiRouter as any)[method].bind(apiRouter);
  (apiRouter as any)[method] = (path: any, ...handlers: any[]) => {
    const wrappedHandlers = handlers.map((fn: any) => {
      if (typeof fn !== 'function') return fn;
      return (req: any, res: any, next: any) => {
        try {
          const ret = fn(req, res, next);
          if (ret && typeof ret.catch === 'function') {
            ret.catch(next);
          }
        } catch (syncErr) {
          next(syncErr);
        }
      };
    });
    return orig(path, ...wrappedHandlers);
  };
}

// ============================================================================
// RATE LIMITING STATE FOR ADMIN LOGIN (5 failed attempts per IP / 15 minutes)
// ============================================================================
interface LoginAttemptRecord {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}
const loginAttempts = new Map<string, LoginAttemptRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const WINDOW_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || '127.0.0.1';
}

function checkRateLimit(ip: string): { allowed: boolean; remainingMinutes?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) return { allowed: true };

  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000);
    return { allowed: false, remainingMinutes };
  }

  // Clear expired window
  if (now - record.firstAttempt > WINDOW_DURATION_MS && !record.lockedUntil) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return;
  }

  record.count += 1;
  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
  }
}

function clearRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}

// ============================================================================
// RATE LIMITING STATE FOR RESERVATIONS (6 per IP / 10 minutes)
// ============================================================================
interface ReservationAttemptRecord {
  count: number;
  firstAttempt: number;
}
const reservationAttempts = new Map<string, ReservationAttemptRecord>();
const MAX_RESERVATION_ATTEMPTS = 6;
const RESERVATION_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function checkReservationRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = reservationAttempts.get(ip);
  if (!record) return true;

  if (now - record.firstAttempt > RESERVATION_WINDOW_MS) {
    reservationAttempts.delete(ip);
    return true;
  }

  return record.count < MAX_RESERVATION_ATTEMPTS;
}

function recordReservationAttempt(ip: string): void {
  const now = Date.now();
  const record = reservationAttempts.get(ip);
  if (!record || now - record.firstAttempt > RESERVATION_WINDOW_MS) {
    reservationAttempts.set(ip, { count: 1, firstAttempt: now });
    return;
  }
  record.count += 1;
}

// ============================================================================
// PUBLIC ENDPOINTS
// ============================================================================

// 1. Check Availability for a Date
apiRouter.get('/availability', async (req: Request, res: Response) => {
  const dateQuery = req.query.date as string;
  const settings = await db.getSettings();
  // Restrict slots strictly to 10:00 AM through 8:00 PM
  const timeSlots = (settings.timeSlots || ALLOWED_TIME_SLOTS).filter((s) =>
    isSlotWithinAllowedHours(s)
  );

  if (!dateQuery) {
    res.status(400).json({ error: 'Date query parameter (YYYY-MM-DD) is required.' });
    return;
  }

  const blockedDates = await db.getBlockedDates();
  const isDateBlocked = blockedDates.some((d) => d.date === dateQuery);
  const isDatePast = isDateInPastIST(dateQuery);
  const blockedSlots = await db.getBlockedSlots();
  const blockedSlotsForDate = blockedSlots
    .filter((s) => s.date === dateQuery)
    .map((s) => s.time);

  // Compute which slots have already elapsed on this date in Asia/Kolkata
  const todayIST = getTodayDateStringIST();
  const isToday = dateQuery === todayIST;
  const cutoffMinutes = (settings.bookingCutoffHours || 0) * 60;

  const isSlotPastCutoff = (slot: string): boolean => {
    if (!isToday || cutoffMinutes <= 0) return false;
    const parsed = parse12HourTime(slot);
    if (!parsed) return true;
    const now = new Date();
    const istParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).formatToParts(now);
    const currH = parseInt(istParts.find((p) => p.type === 'hour')?.value || '0', 10);
    const currM = parseInt(istParts.find((p) => p.type === 'minute')?.value || '0', 10);
    const slotTotalM = parsed.hours * 60 + parsed.minutes;
    const currTotalM = currH * 60 + currM;
    return slotTotalM - currTotalM < cutoffMinutes;
  };

  const elapsedSlots = isDatePast
    ? [...timeSlots]
    : timeSlots.filter((slot) => isSlotElapsedIST(dateQuery, slot) || isSlotPastCutoff(slot));

  // Count reservations per slot for this date
  const allReservations = await db.getReservations();
  const reservations = allReservations
    .filter((r) => r.date === dateQuery && r.status !== 'cancelled');

  const slotBookingCounts: Record<string, number> = {};
  for (const slot of timeSlots) {
    slotBookingCounts[slot] = reservations.filter((r) => r.time === slot).length;
  }

  const availableSlots = (isDateBlocked || isDatePast)
    ? []
    : timeSlots.filter((slot) => {
        if (blockedSlotsForDate.includes(slot)) return false;
        if (elapsedSlots.includes(slot)) return false;
        const count = slotBookingCounts[slot] || 0;
        return count < settings.defaultSlotCapacity;
      });

  res.json({
    date: dateQuery,
    isDateBlocked,
    isDatePast,
    timeSlots,
    blockedSlots: blockedSlotsForDate,
    elapsedSlots,
    availableSlots,
    slotBookingCounts,
    defaultCapacity: settings.defaultSlotCapacity,
  });
});

// 2. Submit a Reservation
apiRouter.post('/reservations', async (req: Request, res: Response) => {
  const clientIp = getClientIp(req);
  if (!checkReservationRateLimit(clientIp)) {
    res.status(429).json({
      error: 'Too many reservation requests from this network. Please wait a few minutes before submitting again.',
    });
    return;
  }

  const { name, phone, email, date, time, guests, zone, notes } = req.body;

  // Input validation & sanitization
  const cleanName = (name || '').trim().replace(/[<>]/g, '');
  if (!cleanName || cleanName.length < 2) {
    res.status(400).json({ error: 'Please enter a valid guest name (at least 2 characters).' });
    return;
  }

  const rawPhone = (phone || '').trim();
  const cleanPhoneDigits = rawPhone.replace(/\D/g, '');
  if (!cleanPhoneDigits || cleanPhoneDigits.length < 7 || cleanPhoneDigits.length > 15) {
    res.status(400).json({ error: 'Please enter a valid contact phone number (7 to 15 digits).' });
    return;
  }

  if (!date || !time) {
    res.status(400).json({ error: 'Booking date and time slot are required.' });
    return;
  }

  // 1. Prohibit bookings for past dates in Asia/Kolkata
  if (isDateInPastIST(date)) {
    res.status(400).json({
      error: 'Reservations cannot be made for past dates. Please select today or a future date.',
    });
    return;
  }

  // 2. Strictly enforce operating hours between 10:00 AM and 8:00 PM
  if (!isSlotWithinAllowedHours(time)) {
    res.status(400).json({
      error: 'Reservation times are restricted to operating hours between 10:00 AM and 8:00 PM.',
    });
    return;
  }

  // 3. Prohibit booking an elapsed time slot for today in Asia/Kolkata
  if (isSlotElapsedIST(date, time)) {
    res.status(400).json({
      error: `The ${time} seating slot has already passed for ${date}. Please select an upcoming slot.`,
    });
    return;
  }

  const settings = await db.getSettings();

  // 4. Validate party size
  const partySizeNum = parseInt(String(guests || '2'), 10);
  if (isNaN(partySizeNum) || partySizeNum < 1) {
    res.status(400).json({ error: 'Party size must be at least 1 guest.' });
    return;
  }
  if (partySizeNum > settings.maxPartySize) {
    res.status(400).json({
      error: `For gatherings larger than ${settings.maxPartySize} guests, please contact our team directly for private salon reservations.`,
    });
    return;
  }

  // 5. Advance notice cutoff enforcement for same-day bookings
  const todayIST = getTodayDateStringIST();
  if (date === todayIST && settings.bookingCutoffHours > 0) {
    const parsed = parse12HourTime(time);
    if (parsed) {
      const now = new Date();
      const istParts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      }).formatToParts(now);
      const currH = parseInt(istParts.find((p) => p.type === 'hour')?.value || '0', 10);
      const currM = parseInt(istParts.find((p) => p.type === 'minute')?.value || '0', 10);
      const slotTotalM = parsed.hours * 60 + parsed.minutes;
      const currTotalM = currH * 60 + currM;
      const cutoffMinutes = settings.bookingCutoffHours * 60;
      if (slotTotalM - currTotalM < cutoffMinutes) {
        res.status(400).json({
          error: `Same-day reservations must be booked at least ${settings.bookingCutoffHours} hour(s) in advance. Please select an alternate slot or visit us directly as a walk-in.`,
        });
        return;
      }
    }
  }

  // 6. Validate date is not blocked
  const blockedDates = await db.getBlockedDates();
  const isDateBlocked = blockedDates.some((d) => d.date === date);
  if (isDateBlocked) {
    res.status(400).json({
      error: 'The café is closed or fully reserved for private gatherings on this date.',
    });
    return;
  }

  // 7. Validate slot is not blocked
  const blockedSlots = await db.getBlockedSlots();
  const isSlotBlocked = blockedSlots.some((s) => s.date === date && s.time === time);
  if (isSlotBlocked) {
    res.status(400).json({
      error: `The ${time} seating slot is unavailable on ${date}. Please choose another time.`,
    });
    return;
  }

  // 8. Duplicate booking protection: prevent double bookings for the same phone on same date/time
  const allReservations = await db.getReservations();
  const duplicate = allReservations.find(
    (r) =>
      r.date === date &&
      r.time === time &&
      r.status !== 'cancelled' &&
      r.phone.replace(/\D/g, '').endsWith(cleanPhoneDigits.slice(-10))
  );
  if (duplicate) {
    res.status(409).json({
      error: `A table reservation is already confirmed for this phone number on ${date} at ${time} (Reference: ${duplicate.reference}). Please contact the café if you need to amend your booking.`,
      existingReference: duplicate.reference,
    });
    return;
  }

  // 9. Check capacity
  const existingInSlot = allReservations
    .filter((r) => r.date === date && r.time === time && r.status !== 'cancelled');

  if (existingInSlot.length >= settings.defaultSlotCapacity) {
    res.status(400).json({
      error: `The ${time} seating has reached full capacity. Please select an alternate slot.`,
    });
    return;
  }

  const status = settings.autoConfirmReservations ? 'confirmed' : 'pending';

  const reservation = await db.addReservation({
    name: cleanName,
    phone: rawPhone,
    email: email && typeof email === 'string' && email.trim() ? email.trim().replace(/[<>]/g, '') : undefined,
    date,
    time,
    guests: String(partySizeNum),
    zone: zone ? String(zone).replace(/[<>]/g, '') : 'The Courtyard',
    notes: notes && typeof notes === 'string' && notes.trim() ? notes.trim().replace(/[<>]/g, '').slice(0, 500) : undefined,
    status,
  });

  // Track attempt count on success
  recordReservationAttempt(clientIp);

  res.status(201).json({
    success: true,
    reservation,
    message: 'Table reservation recorded successfully.',
  });
});

// 3. Public Menu Listing (supports both items and menuItems properties)
apiRouter.get('/menu', async (_req: Request, res: Response) => {
  const allItems = await db.getMenuItems();
  res.json({
    items: allItems,
    menuItems: allItems,
    poured: allItems.filter((i) => i.menuType === 'poured'),
    plated: allItems.filter((i) => i.menuType === 'plated'),
  });
});

// 4. Public Safe Café Settings
apiRouter.get('/settings', async (_req: Request, res: Response) => {
  const settings = await db.getSettings();
  res.json({
    cafeName: settings.cafeName || 'MRDĀ',
    address: settings.address || '6th Floor, Claywalls, Zydus Hospital Road, Thaltej, Ahmedabad, Gujarat 380059, India',
    phone: settings.phone || '+91 87996 00369',
    hours: settings.hours || 'Mon – Sun | 8:00 AM – 10:00 PM',
    maxPartySize: settings.maxPartySize || 12,
    defaultSlotCapacity: settings.defaultSlotCapacity || 20,
    timeSlots: settings.timeSlots || ALLOWED_TIME_SLOTS,
  });
});

// 5. Public Events Listing (published only)
apiRouter.get('/events', async (_req: Request, res: Response) => {
  const events = await db.getEvents(true);
  res.json({ events });
});

// 6. Admin Login with Rate Limiting (5 failed attempts per IP / 15 minutes)
apiRouter.post('/admin/login', async (req: Request, res: Response) => {
  const clientIp = getClientIp(req);
  const rateLimitStatus = checkRateLimit(clientIp);

  if (!rateLimitStatus.allowed) {
    res.status(429).json({
      error: `Too many failed login attempts from this network. Administrative access temporarily locked. Please try again in ${rateLimitStatus.remainingMinutes} minute(s).`,
    });
    return;
  }

  const identifier = req.body.identifier || req.body.email || req.body.username;
  const password = req.body.password;

  if (!identifier || !password) {
    res.status(400).json({ error: 'Email or username and password are required.' });
    return;
  }

  const admin = await db.findAdminByEmailOrUsername(identifier);

  if (!admin) {
    recordFailedAttempt(clientIp);
    res.status(401).json({ error: 'Invalid administrator credentials.' });
    return;
  }

  const isValidPassword = verifyPassword(password, admin.passwordHash, admin.salt);
  if (!isValidPassword) {
    recordFailedAttempt(clientIp);
    res.status(401).json({ error: 'Invalid administrator credentials.' });
    return;
  }

  // Clear failed attempt tracking on successful login
  clearRateLimit(clientIp);

  // Update last login for this specific administrator
  await db.updateAdmin(admin.id, { lastLoginAt: new Date().toISOString() });

  // Log audit
  await db.logAudit({
    action: 'ADMIN_LOGIN',
    adminId: admin.id,
    adminName: admin.name,
    details: `Administrator ${admin.name} (${admin.email}) logged in from IP ${clientIp}`,
  });

  // Create session
  const session = db.createSession(admin.id);

  res.json({
    success: true,
    token: session.token,
    session: {
      token: session.token,
      expiresAt: session.expiresAt,
    },
    expiresAt: session.expiresAt,
    user: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      name: admin.name,
      lastLoginAt: admin.lastLoginAt,
    },
  });
});

// 6. Admin Logout
apiRouter.post('/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const customHeader = req.headers['x-admin-token'] as string;
  let token: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (customHeader) {
    token = customHeader.trim();
  }

  if (token) {
    db.deleteSession(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ============================================================================
// PROTECTED ADMIN ENDPOINTS
// ============================================================================

// Verify current session
apiRouter.get('/admin/me', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.adminUser });
});

// Dashboard Statistics (Asia/Kolkata Business Date Aware)
apiRouter.get('/admin/dashboard', requireAdminAuth, async (_req: AuthenticatedRequest, res: Response) => {
  const reservations = await db.getReservations();
  const menuItems = await db.getMenuItems();
  const events = await db.getEvents(false);
  const blockedSlots = await db.getBlockedSlots();
  const blockedDates = await db.getBlockedDates();

  const todayStr = getTodayDateStringIST();

  const totalReservations = reservations.length;
  const todayReservations = reservations.filter(
    (r) => r.date === todayStr && r.status !== 'cancelled'
  ).length;
  const upcomingReservations = reservations.filter(
    (r) => r.date >= todayStr && r.status !== 'cancelled'
  ).length;
  const pendingReservations = reservations.filter(
    (r) => r.status === 'pending'
  ).length;

  const outOfStockItems = menuItems.filter((i) => !i.inStock);
  const outOfStockCount = outOfStockItems.length;

  const upcomingEvents = events.filter((e) => e.published);
  const upcomingEventsCount = upcomingEvents.length;

  const recentReservations = reservations.slice(0, 7);

  res.json({
    metrics: {
      totalReservations,
      todayReservations,
      upcomingReservations,
      pendingReservations,
      blockedSlotsCount: blockedSlots.length,
      blockedDatesCount: blockedDates.length,
      outOfStockCount,
      upcomingEventsCount,
    },
    todayDateIST: todayStr,
    recentReservations,
    blockedSlotsPreview: blockedSlots.slice(0, 5),
    outOfStockPreview: outOfStockItems.slice(0, 5),
    upcomingEventsPreview: upcomingEvents.slice(0, 3),
  });
});

// Reservations Listing with Filters
apiRouter.get('/admin/reservations', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  let reservations = await db.getReservations();

  const { date, status, search } = req.query;

  if (date && typeof date === 'string') {
    reservations = reservations.filter((r) => r.date === date);
  }

  if (status && typeof status === 'string' && status !== 'all') {
    reservations = reservations.filter((r) => r.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    reservations = reservations.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        r.reference.toLowerCase().includes(q) ||
        r.zone.toLowerCase().includes(q)
    );
  }

  res.json({ reservations, count: reservations.length });
});

// Update Reservation Status
apiRouter.patch(['/admin/reservations/:id/status', '/admin/reservations/:id'], requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status && !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    res.status(400).json({ error: 'Invalid reservation status.' });
    return;
  }

  const updated = status
    ? await db.updateReservationStatus(id, status)
    : await db.updateReservation(id, req.body);

  if (!updated) {
    res.status(404).json({ error: 'Reservation not found.' });
    return;
  }

  res.json({ success: true, reservation: updated });
});

// Cancel / Delete Reservation
apiRouter.delete('/admin/reservations/:id', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const existing = await db.getReservationById(id);
  const deleted = await db.deleteReservation(id);
  if (!deleted) {
    res.status(404).json({ error: 'Reservation not found.' });
    return;
  }
  await db.logAudit({
    action: 'DELETE_RESERVATION',
    adminId: req.adminUser?.id || 'admin',
    adminName: req.adminUser?.name || 'Administrator',
    details: `Deleted reservation ${existing?.reference || id} for ${existing?.name || 'Guest'}`,
    affectedId: id,
  });
  res.json({ success: true, message: 'Reservation cancelled and removed.' });
});

// Edit Existing Reservation (Full Details / Partial Update)
apiRouter.put('/admin/reservations/:id', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, phone, email, date, time, guests, zone, notes, status } = req.body;

  const existing = await db.getReservationById(id);
  if (!existing) {
    res.status(404).json({ error: 'Reservation not found.' });
    return;
  }

  const newName = name !== undefined && name !== null ? name.trim() : existing.name;
  const newPhone = phone !== undefined && phone !== null ? phone.trim() : existing.phone;
  const newDate = date !== undefined && date !== null ? date : existing.date;
  const newTime = time !== undefined && time !== null ? time : existing.time;
  const newGuests = guests !== undefined && guests !== null ? String(guests) : existing.guests;
  const newZone = zone !== undefined && zone !== null ? zone : existing.zone;
  const newNotes = notes !== undefined ? (notes ? notes.trim() : '') : existing.notes;
  const newStatus = status !== undefined && status !== null ? status : existing.status;
  const newEmail = email !== undefined ? (email ? email.trim() : undefined) : existing.email;

  if (!newName) {
    res.status(400).json({ error: 'Guest name is required.' });
    return;
  }

  // If date or time changed, check slot capacity (excluding this reservation)
  if (newDate !== existing.date || newTime !== existing.time) {
    const settings = await db.getSettings();
    const allReservations = await db.getReservations();
    const existingInSlot = allReservations
      .filter((r) => r.id !== id && r.date === newDate && r.time === newTime && r.status !== 'cancelled');

    if (existingInSlot.length >= settings.defaultSlotCapacity) {
      res.status(400).json({
        error: `The ${newTime} seating on ${newDate} is currently at maximum capacity (${settings.defaultSlotCapacity} tables).`,
      });
      return;
    }
  }

  const updated = await db.updateReservation(id, {
    name: newName,
    phone: newPhone,
    email: newEmail,
    date: newDate,
    time: newTime,
    guests: newGuests,
    zone: newZone,
    notes: newNotes,
    status: newStatus,
  });

  if (!updated) {
    res.status(500).json({ error: 'Failed to update reservation record.' });
    return;
  }

  await db.logAudit({
    action: 'RESERVATION_UPDATE',
    adminId: req.adminUser?.id || 'admin',
    adminName: req.adminUser?.name || 'Administrator',
    details: `Updated reservation ${updated.reference} for ${updated.name} (${updated.date} ${updated.time}, ${updated.guests} guests)`,
    affectedId: id,
  });

  res.json({ success: true, reservation: updated, message: 'Reservation updated successfully.' });
});

// Dedicated Admin Booking Creation (Supports Walk-ins, Phone Orders, and Controlled Manager Overrides)
apiRouter.post('/admin/reservations', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { name, phone, email, date, time, guests, zone, notes, status, isOverride, overrideReason } = req.body;

  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Guest name is required.' });
    return;
  }
  if (!phone || !phone.trim()) {
    res.status(400).json({ error: 'Guest phone number is required.' });
    return;
  }
  if (!date || !time) {
    res.status(400).json({ error: 'Booking date and time slot are required.' });
    return;
  }

  const settings = await db.getSettings();
  const blockedDates = await db.getBlockedDates();
  const isDateBlocked = blockedDates.some((d) => d.date === date);
  const blockedSlots = await db.getBlockedSlots();
  const isSlotBlocked = blockedSlots.some((s) => s.date === date && s.time === time);
  const isPastDate = isDateInPastIST(date);
  const isPastSlot = isSlotElapsedIST(date, time);

  // Check capacity
  const allReservations = await db.getReservations();
  const existingInSlot = allReservations
    .filter((r) => r.date === date && r.time === time && r.status !== 'cancelled');
  const isAtCapacity = existingInSlot.length >= settings.defaultSlotCapacity;

  // If any exception condition is present, require explicit override and justification
  const hasException = isDateBlocked || isSlotBlocked || isPastDate || isPastSlot || isAtCapacity;

  if (hasException && !isOverride) {
    let reasonText = '';
    if (isPastDate || isPastSlot) reasonText = 'The selected date/slot has already passed.';
    else if (isDateBlocked) reasonText = 'The café has a full-day closure scheduled on this date.';
    else if (isSlotBlocked) reasonText = `The ${time} seating is explicitly marked as blocked.`;
    else if (isAtCapacity) reasonText = `The ${time} seating has reached full capacity (${settings.defaultSlotCapacity} tables).`;

    res.status(400).json({
      error: `${reasonText} To proceed with this booking as an operational exception, please enable "Manager Override" and provide a reason.`,
      requiresOverride: true,
    });
    return;
  }

  if (isOverride && (!overrideReason || overrideReason.trim().length < 3)) {
    res.status(400).json({
      error: 'A detailed manager override justification (minimum 3 characters) is required when booking an exception.',
    });
    return;
  }

  const reservation = await db.addReservation({
    name: name.trim(),
    phone: phone.trim(),
    email: email ? email.trim() : undefined,
    date,
    time,
    guests: String(guests || '2'),
    zone: zone || 'The Courtyard',
    notes: notes ? notes.trim() : undefined,
    status: status || 'confirmed',
  });

  await db.logAudit({
    action: isOverride ? 'ADMIN_BOOKING_OVERRIDE' : 'ADMIN_MANUAL_BOOKING',
    adminId: req.adminUser?.id || 'admin',
    adminName: req.adminUser?.name || 'Administrator',
    details: `Created reservation ${reservation.reference} for ${reservation.name} (${reservation.date} ${reservation.time})`,
    affectedId: reservation.id,
    overrideReason: isOverride ? overrideReason.trim() : undefined,
  });

  res.status(201).json({
    success: true,
    reservation,
    message: 'Reservation recorded successfully by staff.',
  });
});

// Duplicate Reservation Check (Pre-flight warning for administrators)
apiRouter.get('/admin/reservations/check-duplicate', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { phone, date } = req.query;
  if (!phone || !date || typeof phone !== 'string' || typeof date !== 'string') {
    res.json({ isDuplicate: false, count: 0 });
    return;
  }

  const cleanPhone = phone.replace(/\D/g, '');
  const allReservations = await db.getReservations();
  const matches = allReservations
    .filter(
      (r) =>
        r.date === date &&
        r.status !== 'cancelled' &&
        r.phone.replace(/\D/g, '').endsWith(cleanPhone.slice(-10))
    );

  res.json({
    isDuplicate: matches.length > 0,
    count: matches.length,
    matches,
  });
});

// Audit Trail Listing
apiRouter.get('/admin/audit-logs', requireAdminAuth, async (_req: AuthenticatedRequest, res: Response) => {
  const logs = await db.getAuditLogs(50);
  res.json({ auditLogs: logs });
});

// Availability Admin
apiRouter.get('/admin/availability', requireAdminAuth, async (_req: AuthenticatedRequest, res: Response) => {
  const blockedDates = await db.getBlockedDates();
  const blockedSlots = await db.getBlockedSlots();
  const settings = await db.getSettings();

  res.json({
    blockedDates,
    blockedSlots,
    timeSlots: settings.timeSlots,
    defaultCapacity: settings.defaultSlotCapacity,
  });
});

apiRouter.post('/admin/availability/block-slot', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { date, time, reason } = req.body;
  if (!date || !time) {
    res.status(400).json({ error: 'Date and time slot are required.' });
    return;
  }
  const slot = await db.blockSlot(date, time, reason);
  await db.logAudit({
    action: 'BLOCK_SLOT',
    adminId: req.adminUser?.id || 'admin',
    adminName: req.adminUser?.name || 'Administrator',
    details: `Blocked seating slot ${time} on ${date}${reason ? ` (${reason})` : ''}`,
  });
  res.json({ success: true, slot });
});

apiRouter.post('/admin/availability/unblock-slot', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { date, time } = req.body;
  if (!date || !time) {
    res.status(400).json({ error: 'Date and time slot are required.' });
    return;
  }
  const success = await db.unblockSlot(date, time);
  await db.logAudit({
    action: 'UNBLOCK_SLOT',
    adminId: req.adminUser?.id || 'admin',
    adminName: req.adminUser?.name || 'Administrator',
    details: `Unblocked seating slot ${time} on ${date}`,
  });
  res.json({ success });
});

apiRouter.post('/admin/availability/block-date', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { date, reason } = req.body;
  if (!date) {
    res.status(400).json({ error: 'Date is required.' });
    return;
  }
  const blocked = await db.blockDate(date, reason);
  await db.logAudit({
    action: 'BLOCK_DATE',
    adminId: req.adminUser?.id || 'admin',
    adminName: req.adminUser?.name || 'Administrator',
    details: `Blocked full date ${date}${reason ? ` (${reason})` : ''}`,
  });
  res.json({ success: true, blocked });
});

apiRouter.post('/admin/availability/unblock-date', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { date } = req.body;
  if (!date) {
    res.status(400).json({ error: 'Date is required.' });
    return;
  }
  const success = await db.unblockDate(date);
  await db.logAudit({
    action: 'UNBLOCK_DATE',
    adminId: req.adminUser?.id || 'admin',
    adminName: req.adminUser?.name || 'Administrator',
    details: `Unblocked date ${date}`,
  });
  res.json({ success });
});

// Menu Admin
apiRouter.get('/admin/menu', requireAdminAuth, async (_req: AuthenticatedRequest, res: Response) => {
  const items = await db.getMenuItems();
  res.json({ items });
});

apiRouter.post('/admin/menu/items', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { name, price, description, tag, categoryId, categoryTitle, menuType, inStock, image } =
    req.body;

  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Item name is required.' });
    return;
  }
  if (price === undefined || price === null || price === '') {
    res.status(400).json({ error: 'Item price is required.' });
    return;
  }

  const newItem = await db.addMenuItem({
    name: name.trim(),
    price: typeof price === 'number' ? price : String(price).trim(),
    description: description ? description.trim() : '',
    tag: tag || undefined,
    categoryId: categoryId || 'signatures',
    categoryTitle: categoryTitle || 'SIGNATURES',
    menuType: menuType === 'plated' ? 'plated' : 'poured',
    inStock: inStock !== false,
    image: image ? image.trim() : undefined,
  });

  await db.logAudit({
    action: 'CREATE_MENU_ITEM',
    adminId: req.adminUser?.id || 'admin',
    adminName: req.adminUser?.name || 'Administrator',
    details: `Created menu item "${newItem.name}" in category "${newItem.categoryTitle}"`,
    affectedId: newItem.id,
  });

  res.status(201).json({ success: true, item: newItem });
});

apiRouter.put('/admin/menu/items/:id', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = await db.updateMenuItem(id, updates);
  if (!updated) {
    res.status(404).json({ error: 'Menu item not found.' });
    return;
  }

  await db.logAudit({
    action: 'UPDATE_MENU_ITEM',
    adminId: req.adminUser?.id || 'admin',
    adminName: req.adminUser?.name || 'Administrator',
    details: `Updated menu item "${updated.name}" (${id})`,
    affectedId: id,
  });

  res.json({ success: true, item: updated });
});

apiRouter.patch('/admin/menu/items/:id/stock', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updated = await db.toggleItemStock(id);
  if (!updated) {
    res.status(404).json({ error: 'Menu item not found.' });
    return;
  }

  await db.logAudit({
    action: 'TOGGLE_MENU_STOCK',
    adminId: req.adminUser?.id || 'admin',
    adminName: req.adminUser?.name || 'Administrator',
    details: `Toggled stock status for "${updated.name}" to ${updated.inStock ? 'In Stock' : 'Out of Stock'}`,
    affectedId: id,
  });

  res.json({ success: true, item: updated });
});

apiRouter.delete('/admin/menu/items/:id', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const existing = await db.getMenuItemById(id);
  const success = await db.deleteMenuItem(id);
  if (!success) {
    res.status(404).json({ error: 'Menu item not found.' });
    return;
  }

  await db.logAudit({
    action: 'DELETE_MENU_ITEM',
    adminId: req.adminUser?.id || 'admin',
    adminName: req.adminUser?.name || 'Administrator',
    details: `Deleted menu item "${existing?.name || id}"`,
    affectedId: id,
  });

  res.json({ success: true, message: 'Menu item removed.' });
});

// Events Admin
apiRouter.get('/admin/events', requireAdminAuth, async (_req: AuthenticatedRequest, res: Response) => {
  const events = await db.getEvents(false); // all events including drafts
  res.json({ events });
});

apiRouter.post('/admin/events', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { title, type, date, time, description, performers, venue, published, posterImage, spots } =
    req.body;

  if (!title || !title.trim()) {
    res.status(400).json({ error: 'Event title is required.' });
    return;
  }
  if (!date || !time) {
    res.status(400).json({ error: 'Event date and time are required.' });
    return;
  }

  const newEvent = await db.addEvent({
    title: title.trim(),
    type: type || 'Gathering',
    date: date.trim(),
    time: time.trim(),
    description: description ? description.trim() : '',
    performers: performers ? performers.trim() : undefined,
    venue: venue || 'The Sunlit Courtyard, The Claywalls',
    published: published !== false,
    posterImage: posterImage || '/assets/aistudio/event-1_5eaf748b.jpg',
    spots: spots || 'Open entry',
  });

  await db.logAudit({
    action: 'CREATE_EVENT',
    adminId: req.adminUser?.id || 'admin',
    adminName: req.adminUser?.name || 'Administrator',
    details: `Created event "${newEvent.title}" (${newEvent.date})`,
    affectedId: newEvent.id,
  });

  res.status(201).json({ success: true, event: newEvent });
});

apiRouter.put('/admin/events/:id', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = await db.updateEvent(id, updates);
  if (!updated) {
    res.status(404).json({ error: 'Event not found.' });
    return;
  }

  await db.logAudit({
    action: 'UPDATE_EVENT',
    adminId: req.adminUser?.id || 'admin',
    adminName: req.adminUser?.name || 'Administrator',
    details: `Updated event "${updated.title}"`,
    affectedId: id,
  });

  res.json({ success: true, event: updated });
});

apiRouter.patch('/admin/events/:id/publish', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updated = await db.toggleEventPublish(id);
  if (!updated) {
    res.status(404).json({ error: 'Event not found.' });
    return;
  }

  await db.logAudit({
    action: 'TOGGLE_EVENT_PUBLISH',
    adminId: req.adminUser?.id || 'admin',
    adminName: req.adminUser?.name || 'Administrator',
    details: `Toggled publication for "${updated.title}" to ${updated.published ? 'Published' : 'Draft'}`,
    affectedId: id,
  });

  res.json({ success: true, event: updated });
});

apiRouter.delete('/admin/events/:id', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const existing = await db.getEventById(id);
  const success = await db.deleteEvent(id);
  if (!success) {
    res.status(404).json({ error: 'Event not found.' });
    return;
  }

  await db.logAudit({
    action: 'DELETE_EVENT',
    adminId: req.adminUser?.id || 'admin',
    adminName: req.adminUser?.name || 'Administrator',
    details: `Deleted event "${existing?.title || id}"`,
    affectedId: id,
  });

  res.json({ success: true, message: 'Event deleted.' });
});

// Settings Admin
apiRouter.get('/admin/settings', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const settings = await db.getSettings();
  const admin = (req.adminUser?.id ? db.findAdminById(req.adminUser.id) : null) || db.getAdmin();
  const a1 = db.findAdminById('admin-1');
  const a2 = db.findAdminById('admin-2');
  const adminAccounts = [
    ...(a1 ? [{ id: a1.id, username: a1.username, email: a1.email, name: a1.name, lastLoginAt: a1.lastLoginAt, role: 'Administrator' }] : []),
    ...(a2 ? [{ id: a2.id, username: a2.username, email: a2.email, name: a2.name, lastLoginAt: a2.lastLoginAt, role: 'Administrator' }] : []),
  ];

  res.json({
    settings,
    adminProfile: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      name: admin.name,
      lastLoginAt: admin.lastLoginAt,
    },
    adminAccounts,
  });
});

apiRouter.put('/admin/settings', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const updates = req.body;
  const updated = await db.updateSettings(updates);

  await db.logAudit({
    action: 'SETTINGS_UPDATE',
    adminId: req.adminUser?.id || 'admin',
    adminName: req.adminUser?.name || 'Administrator',
    details: `Updated café settings and operational parameters`,
  });

  res.json({ success: true, settings: updated });
});

apiRouter.post('/admin/settings/credentials', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, targetAdminId, newUsername, newEmail, newPassword, newName } = req.body;

  if (!currentPassword) {
    res.status(400).json({ error: 'Current password is required to update credentials.' });
    return;
  }

  const callerAdmin = (req.adminUser?.id ? db.findAdminById(req.adminUser.id) : null) || db.getAdmin();
  const isValid = verifyPassword(currentPassword, callerAdmin.passwordHash, callerAdmin.salt);
  if (!isValid) {
    res.status(401).json({ error: 'Incorrect current password.' });
    return;
  }

  // Determine target account to update: defaults to caller's own account
  const targetId = targetAdminId && typeof targetAdminId === 'string' ? targetAdminId.trim() : callerAdmin.id;

  // Both active administrative accounts (admin-1, admin-2) can be updated
  if (targetId !== 'admin-1' && targetId !== 'admin-2') {
    res.status(400).json({ error: 'Target account is not an active administrative account.' });
    return;
  }

  const targetAdmin = db.findAdminById(targetId);
  if (!targetAdmin) {
    res.status(404).json({ error: 'Target administrator account not found.' });
    return;
  }

  const updates: Record<string, string> = {};

  if (newUsername && newUsername.trim()) {
    const existing = await db.findAdminByEmailOrUsername(newUsername.trim());
    if (existing && existing.id !== targetAdmin.id) {
      res.status(400).json({ error: 'Username is already in use by another administrator.' });
      return;
    }
    updates.username = newUsername.trim();
  }
  if (newEmail && newEmail.trim()) {
    const existing = await db.findAdminByEmailOrUsername(newEmail.trim());
    if (existing && existing.id !== targetAdmin.id) {
      res.status(400).json({ error: 'Email address is already in use by another administrator.' });
      return;
    }
    updates.email = newEmail.trim().toLowerCase();
    const currentEnvEmail = targetAdmin.id === 'admin-1'
      ? (process.env.ADMIN_EMAIL_1 || process.env.ADMIN_EMAIL || '')
      : (process.env.ADMIN_EMAIL_2 || process.env.STAFF_EMAIL || '');
    if (currentEnvEmail) {
      updates.syncedEnvEmail = currentEnvEmail.toLowerCase();
    }
  }
  if (newName && newName.trim()) {
    updates.name = newName.trim();
  }
  const passwordChanged = Boolean(newPassword && newPassword.trim());
  if (passwordChanged) {
    if (newPassword.trim().length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters long.' });
      return;
    }
    const newSalt = generateSalt();
    const newHash = hashPassword(newPassword.trim(), newSalt);
    updates.salt = newSalt;
    updates.passwordHash = newHash;

    const currentEnvPass = targetAdmin.id === 'admin-1'
      ? (process.env.ADMIN_PASSWORD_1 || process.env.ADMIN_PASSWORD || '')
      : (process.env.ADMIN_PASSWORD_2 || process.env.STAFF_PASSWORD || '');
    if (currentEnvPass) {
      updates.syncedEnvPasswordHash = getSecretFingerprint(currentEnvPass);
    }
  }

  const updatedAdmin = await db.updateAdmin(targetAdmin.id, updates);
  if (!updatedAdmin) {
    res.status(500).json({ error: 'Failed to update credentials.' });
    return;
  }

  let newToken: string | undefined = undefined;
  if (passwordChanged) {
    // Invalidate all active sessions for this specific target account
    await db.invalidateAdminSessions(targetAdmin.id);

    // If caller changed their own password, generate a fresh session token so caller's active session continues seamlessly
    if (callerAdmin.id === targetAdmin.id) {
      const newSession = await db.createSession(targetAdmin.id);
      newToken = newSession.token;
    }
  }

  await db.logAudit({
    action: 'SETTINGS_UPDATE',
    adminId: callerAdmin.id,
    adminName: callerAdmin.name,
    details: `Administrator credentials/profile updated for ${updatedAdmin.name} (${updatedAdmin.email}, ID: ${updatedAdmin.id}) by ${callerAdmin.name}`,
    affectedId: targetAdmin.id,
  });

  res.json({
    success: true,
    message: `Administrator credentials for ${updatedAdmin.name} updated successfully.`,
    adminProfile: {
      id: updatedAdmin.id,
      username: updatedAdmin.username,
      email: updatedAdmin.email,
      name: updatedAdmin.name,
    },
    newToken,
  });
});

// Centralized error handling middleware for all API endpoints
apiRouter.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('[API Router Error]:', err);
  const status = typeof err.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 500;
  res.status(status).json({
    error: err.message || 'An unexpected database or server error occurred.',
  });
});
