-- =====================================================================
-- MRDĀ Café — Complete Supabase PostgreSQL Schema (Idempotent & Safe)
-- Canonical database definition matching existing application architecture
-- Safe to run multiple times on fresh or existing databases without data loss
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. HELPER FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. ADMIN PROFILES
-- Matches existing 2 active administrative accounts with equal permissions (admin-1, admin-2)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id TEXT PRIMARY KEY,
  supabase_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_admin_profiles_modtime ON public.admin_profiles;
CREATE TRIGGER update_admin_profiles_modtime
BEFORE UPDATE ON public.admin_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. MENU ITEMS
-- Preserves exact dual-price formatting (e.g. "190 / 210", "260 / 280", "360 / 490")
CREATE TABLE IF NOT EXISTS public.menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  description TEXT,
  tag TEXT CHECK (tag IN ('Caffeinated', 'Non-Caffeinated', 'Vegan', 'Vegetarian', 'Specialty', NULL)),
  category_id TEXT NOT NULL,
  category_title TEXT NOT NULL,
  menu_type TEXT NOT NULL CHECK (menu_type IN ('poured', 'plated')),
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  image TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_type ON public.menu_items(menu_type);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_stock ON public.menu_items(in_stock);

DROP TRIGGER IF EXISTS update_menu_items_modtime ON public.menu_items;
CREATE TRIGGER update_menu_items_modtime
BEFORE UPDATE ON public.menu_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. EVENTS
-- Supports fixed ISO dates (e.g. "2026-10-31") and recurring text ("Alternate Saturdays")
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  description TEXT NOT NULL,
  performers TEXT,
  venue TEXT NOT NULL DEFAULT 'MRDĀ, 6th Floor, Claywalls, Ahmedabad',
  published BOOLEAN NOT NULL DEFAULT TRUE,
  poster_image TEXT,
  spots TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_published ON public.events(published);

DROP TRIGGER IF EXISTS update_events_modtime ON public.events;
CREATE TRIGGER update_events_modtime
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. CAFE SETTINGS
CREATE TABLE IF NOT EXISTS public.cafe_settings (
  id TEXT PRIMARY KEY DEFAULT 'current',
  cafe_name TEXT NOT NULL DEFAULT 'MRDĀ',
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  hours TEXT NOT NULL,
  booking_cutoff_hours INTEGER NOT NULL DEFAULT 2,
  max_party_size INTEGER NOT NULL DEFAULT 12,
  default_slot_capacity INTEGER NOT NULL DEFAULT 20,
  auto_confirm_reservations BOOLEAN NOT NULL DEFAULT TRUE,
  time_slots JSONB NOT NULL DEFAULT '["10:00 AM","12:00 PM","2:00 PM","4:30 PM","6:30 PM","8:00 PM"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_cafe_settings_modtime ON public.cafe_settings;
CREATE TRIGGER update_cafe_settings_modtime
BEFORE UPDATE ON public.cafe_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. RESERVATIONS
CREATE TABLE IF NOT EXISTS public.reservations (
  id TEXT PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  guests TEXT NOT NULL,
  zone TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  is_override BOOLEAN NOT NULL DEFAULT FALSE,
  override_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_phone ON public.reservations(phone);

DROP TRIGGER IF EXISTS update_reservations_modtime ON public.reservations;
CREATE TRIGGER update_reservations_modtime
BEFORE UPDATE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. BLOCKED SLOTS
CREATE TABLE IF NOT EXISTS public.blocked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  time TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(date, time)
);

CREATE INDEX IF NOT EXISTS idx_blocked_slots_date ON public.blocked_slots(date);

-- 9. BLOCKED DATES
CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON public.blocked_dates(date);

-- 10. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  admin_id TEXT NOT NULL,
  admin_name TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  details TEXT NOT NULL,
  affected_id TEXT,
  override_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cafe_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: check if caller is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE supabase_user_id = auth.uid()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- MENU ITEMS: Anyone can view items, only admin can mutate
DROP POLICY IF EXISTS "Public can view menu items" ON public.menu_items;
CREATE POLICY "Public can view menu items"
ON public.menu_items FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin can manage menu items" ON public.menu_items;
CREATE POLICY "Admin can manage menu items"
ON public.menu_items FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- EVENTS: Public can view published events, admin can manage all
DROP POLICY IF EXISTS "Public can view published events" ON public.events;
CREATE POLICY "Public can view published events"
ON public.events FOR SELECT
USING (published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin can manage events" ON public.events;
CREATE POLICY "Admin can manage events"
ON public.events FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- CAFE SETTINGS: Public can view settings, admin can update
DROP POLICY IF EXISTS "Public can view cafe settings" ON public.cafe_settings;
CREATE POLICY "Public can view cafe settings"
ON public.cafe_settings FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin can update cafe settings" ON public.cafe_settings;
CREATE POLICY "Admin can update cafe settings"
ON public.cafe_settings FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- RESERVATIONS: Public can insert reservations, admin can view & update all
DROP POLICY IF EXISTS "Public can insert reservation" ON public.reservations;
CREATE POLICY "Public can insert reservation"
ON public.reservations FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can manage all reservations" ON public.reservations;
CREATE POLICY "Admin can manage all reservations"
ON public.reservations FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- BLOCKED SLOTS / DATES: Public can view to check availability, admin can manage
DROP POLICY IF EXISTS "Public can view blocked slots" ON public.blocked_slots;
CREATE POLICY "Public can view blocked slots"
ON public.blocked_slots FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin can manage blocked slots" ON public.blocked_slots;
CREATE POLICY "Admin can manage blocked slots"
ON public.blocked_slots FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can view blocked dates" ON public.blocked_dates;
CREATE POLICY "Public can view blocked dates"
ON public.blocked_dates FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin can manage blocked dates" ON public.blocked_dates;
CREATE POLICY "Admin can manage blocked dates"
ON public.blocked_dates FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- AUDIT LOGS: Admin only
DROP POLICY IF EXISTS "Admin can view audit logs" ON public.audit_logs;
CREATE POLICY "Admin can view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can insert audit logs" ON public.audit_logs;
CREATE POLICY "Admin can insert audit logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- ADMIN PROFILES: Admin can view admin profiles
DROP POLICY IF EXISTS "Admin can view admin profiles" ON public.admin_profiles;
CREATE POLICY "Admin can view admin profiles"
ON public.admin_profiles FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can update own profile" ON public.admin_profiles;
CREATE POLICY "Admin can update own profile"
ON public.admin_profiles FOR UPDATE
TO authenticated
USING (supabase_user_id = auth.uid() OR public.is_admin())
WITH CHECK (supabase_user_id = auth.uid() OR public.is_admin());
