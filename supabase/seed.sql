-- =====================================================================
-- MRDĀ Café — Complete Production Seed SQL
-- Migrates exact existing data: 47 menu items, 5 events, cafe settings, 3 admins
-- =====================================================================

-- 1. CAFE SETTINGS
INSERT INTO public.cafe_settings (
  id, cafe_name, address, phone, hours, booking_cutoff_hours,
  max_party_size, default_slot_capacity, auto_confirm_reservations, time_slots
) VALUES (
  'current',
  'MRDĀ',
  '6th Floor, Claywalls, Zydus Hospital Road, Opposite Verantes, Thaltej, Ahmedabad, Gujarat 380059, India',
  '+91 87996 00369',
  'Mon - Sun | 8:00 AM - 10:00 PM',
  2,
  12,
  20,
  TRUE,
  '["10:00 AM","12:00 PM","2:00 PM","4:30 PM","6:30 PM","8:00 PM"]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  cafe_name = EXCLUDED.cafe_name,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  hours = EXCLUDED.hours,
  booking_cutoff_hours = EXCLUDED.booking_cutoff_hours,
  max_party_size = EXCLUDED.max_party_size,
  default_slot_capacity = EXCLUDED.default_slot_capacity,
  auto_confirm_reservations = EXCLUDED.auto_confirm_reservations,
  time_slots = EXCLUDED.time_slots,
  updated_at = NOW();

-- 2. ADMIN PROFILES (2 Active Accounts: Owner and Café & Staff)
INSERT INTO public.admin_profiles (id, username, email, name, role)
VALUES (
  'admin-1',
  'admin',
  'admin@atmrda.com',
  'Café Owner',
  'admin'
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  updated_at = NOW();

INSERT INTO public.admin_profiles (id, username, email, name, role)
VALUES (
  'admin-2',
  'staff',
  'staff@atmrda.com',
  'Café & Staff',
  'admin'
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  updated_at = NOW();

-- 3. MENU ITEMS (47 items with exact dual price strings)
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-sig-1',
  'Orange Jalapeno (The OJ)',
  '360',
  'Malta orange concentrate, fresh jalapeno, Thai basil & lemon',
  'Specialty',
  'signatures',
  'SIGNATURES',
  'poured',
  TRUE,
  1
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-sig-2',
  'Garden Puff',
  '360',
  'Fresh cucumber, housemade rosemary cordial, smoked dried rosemary',
  'Specialty',
  'signatures',
  'SIGNATURES',
  'poured',
  TRUE,
  2
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-sig-3',
  'Dal Stock Xchange',
  '390',
  'If you figure it out, pls let us know',
  'Specialty',
  'signatures',
  'SIGNATURES',
  'poured',
  TRUE,
  3
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-sig-4',
  'Bees & Beans',
  '390',
  'Single origin espresso, raw unprocessed ajwain honey, tonic water',
  'Caffeinated',
  'signatures',
  'SIGNATURES',
  'poured',
  TRUE,
  4
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-sig-5',
  'Purple Sea',
  '390',
  'Steeped lavender buds infused with butterfly pea flowers, macerated pineapple, 100% dairy cream cloud, orange zest',
  'Specialty',
  'signatures',
  'SIGNATURES',
  'poured',
  TRUE,
  5
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-sig-6',
  'Bloody Jasmine',
  '390',
  'Steeped Jasmine Pearl Tea, fermented Falsa juice, lemon zest, raw & unprocessed Himalayan forest honey, dairy cream cloud',
  'Specialty',
  'signatures',
  'SIGNATURES',
  'poured',
  TRUE,
  6
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-sig-7',
  'Penicillin',
  '390',
  'Single origin espresso, ginger honey potion, organic raw sugar, housemade soda',
  'Caffeinated',
  'signatures',
  'SIGNATURES',
  'poured',
  TRUE,
  7
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-sig-8',
  'Espresso Sour',
  '390',
  'Single origin espresso, housemade mix spice syrup, raw & unprocessed Himalayan forest honey',
  'Caffeinated',
  'signatures',
  'SIGNATURES',
  'poured',
  TRUE,
  8
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-sig-9',
  'Sun & Soil',
  '390',
  'Macerated pineapple, housemade fermented pineapple vinegar, coconut water, coconut cream',
  'Specialty',
  'signatures',
  'SIGNATURES',
  'poured',
  TRUE,
  9
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-sig-10',
  'Soul Kaaphi',
  '430',
  'Inspired by solkadhi, a drink for your soul',
  'Specialty',
  'signatures',
  'SIGNATURES',
  'poured',
  TRUE,
  10
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-sig-11',
  'London Fog',
  '430',
  'Steeped earl grey tea, organic milk, housemade vanilla bean syrup finished with dried lavender buds',
  'Specialty',
  'signatures',
  'SIGNATURES',
  'poured',
  TRUE,
  11
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-sig-12',
  'Oatcino',
  '430',
  'Single origin espresso, organic coconut sugar & oatmilk',
  'Vegan',
  'signatures',
  'SIGNATURES',
  'poured',
  TRUE,
  12
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-slow-1',
  'Classic Cold Brew',
  '260',
  '18-hour cold steeped single-origin roast',
  'Caffeinated',
  'slow-brewed',
  'SLOW BREWED',
  'poured',
  TRUE,
  13
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-slow-2',
  'Ginger Ajwain Cold Brew',
  '290',
  'Infused with fresh crushed ginger and carom seeds',
  'Caffeinated',
  'slow-brewed',
  'SLOW BREWED',
  'poured',
  TRUE,
  14
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-slow-3',
  'Coconut Cold Brew',
  '330',
  'Layered with tender coconut water',
  'Caffeinated',
  'slow-brewed',
  'SLOW BREWED',
  'poured',
  TRUE,
  15
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-slow-4',
  'V60 Pour Over (Indian Beans)',
  '360',
  'Precision filtered single estate beans',
  'Caffeinated',
  'slow-brewed',
  'SLOW BREWED',
  'poured',
  TRUE,
  16
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-slow-5',
  'V60 Pour Over (International Beans)',
  '490',
  'Rotating world micro-lots',
  'Caffeinated',
  'slow-brewed',
  'SLOW BREWED',
  'poured',
  TRUE,
  17
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-slow-6',
  'Chemex',
  '360 / 490',
  'Clean, tea-like aromatic cup',
  'Caffeinated',
  'slow-brewed',
  'SLOW BREWED',
  'poured',
  TRUE,
  18
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-ground-1',
  'Espresso (Hot / Iced)',
  '190 / 210',
  'Double shot single-origin extraction',
  'Caffeinated',
  'grounded',
  'GROUNDED & SHIFTED',
  'poured',
  TRUE,
  19
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-ground-2',
  'Americano (Hot / Iced)',
  '210 / 230',
  'Espresso over hot water or ice',
  'Caffeinated',
  'grounded',
  'GROUNDED & SHIFTED',
  'poured',
  TRUE,
  20
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-ground-3',
  'Cortado (Hot / Iced)',
  '230 / 250',
  'Equal parts espresso and warm textured milk',
  'Caffeinated',
  'grounded',
  'GROUNDED & SHIFTED',
  'poured',
  TRUE,
  21
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-ground-4',
  'Cappuccino',
  '260',
  'Velvety microfoam over double espresso',
  'Caffeinated',
  'grounded',
  'GROUNDED & SHIFTED',
  'poured',
  TRUE,
  22
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-ground-5',
  'Café Latte (Hot / Iced)',
  '260 / 280',
  'Smooth, comforting classic',
  'Caffeinated',
  'grounded',
  'GROUNDED & SHIFTED',
  'poured',
  TRUE,
  23
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-ground-6',
  'Flat White',
  '260',
  'Thin layer of microfoam, rich double shot',
  'Caffeinated',
  'grounded',
  'GROUNDED & SHIFTED',
  'poured',
  TRUE,
  24
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-ground-7',
  'Spanish Latte (Hot / Iced)',
  '360 / 390',
  'Sweetened condensed milk, espresso, fresh milk',
  'Caffeinated',
  'grounded',
  'GROUNDED & SHIFTED',
  'poured',
  TRUE,
  25
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-ground-8',
  'Affogato',
  '390',
  'Double espresso poured over artisanal vanilla gelato',
  'Specialty',
  'grounded',
  'GROUNDED & SHIFTED',
  'poured',
  TRUE,
  26
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-tea-1',
  'Usucha (Matcha)',
  '460',
  'Traditional thin ceremonial whisked tea from Kagoshima',
  'Specialty',
  'matcha-tea',
  'MATCHA, HOJICHA & TEAS',
  'poured',
  TRUE,
  27
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-tea-2',
  'Matcha Latte (Hot / Iced)',
  '510 / 530',
  'Kagoshima matcha whisked with oat or whole milk',
  'Specialty',
  'matcha-tea',
  'MATCHA, HOJICHA & TEAS',
  'poured',
  TRUE,
  28
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-tea-3',
  'Coconut Matcha Cooler',
  '590',
  'Tender coconut water, coconut foam, ceremonial matcha',
  'Specialty',
  'matcha-tea',
  'MATCHA, HOJICHA & TEAS',
  'poured',
  TRUE,
  29
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'poured-tea-4',
  'Iced Hojicha Latte',
  '360',
  'Deep smoky aroma & caramelised undertones',
  'Specialty',
  'matcha-tea',
  'MATCHA, HOJICHA & TEAS',
  'poured',
  TRUE,
  30
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'plated-day-1',
  'Milk Oats',
  '330',
  'Rolled oats in wild forest honey milk, topped with banana, frozen berry jam, seeds & coconut',
  'Vegetarian',
  'daybreak',
  'DAYBREAK & FRENCH TOASTS',
  'plated',
  TRUE,
  31
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'plated-day-2',
  'Tadka Buttermilk Oats',
  '330',
  'Ghee tempered buttermilk soaked oats with chia seeds, coriander & pomegranate pearls',
  'Vegetarian',
  'daybreak',
  'DAYBREAK & FRENCH TOASTS',
  'plated',
  TRUE,
  32
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'plated-day-3',
  'Paneer Bhurji Toast',
  '360',
  'Paneer with peppers, aam kasundi & chilli guava butter with side of toasted sourdough, roasted sweet potato & slaw',
  'Vegetarian',
  'daybreak',
  'DAYBREAK & FRENCH TOASTS',
  'plated',
  TRUE,
  33
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'plated-day-4',
  'Honey Nutmeg French Toast',
  '490',
  'Wild forest honey, mascarpone cream & nutmeg',
  'Vegetarian',
  'daybreak',
  'DAYBREAK & FRENCH TOASTS',
  'plated',
  TRUE,
  34
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'plated-day-5',
  'Strawberry French Toast',
  '490',
  'House strawberry jam, mascarpone cream',
  'Vegetarian',
  'daybreak',
  'DAYBREAK & FRENCH TOASTS',
  'plated',
  TRUE,
  35
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'plated-sal-1',
  'Soil & Season Salad',
  '430',
  'Chef-curated fruits of the season, inspired by the earth''s freshest offerings',
  'Vegan',
  'salads-tapas',
  'SALADS & TAPAS PLATES',
  'plated',
  TRUE,
  36
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'plated-sal-2',
  'Crispy Black Rice Salad',
  '460',
  'Locally sourced crisped black rice, coconut cream dressing, veggies, roasted peanuts & sweet potato shreds',
  'Vegan',
  'salads-tapas',
  'SALADS & TAPAS PLATES',
  'plated',
  TRUE,
  37
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'plated-sal-3',
  'Black Bean Tacos',
  '330',
  'Single-origin black beans, fresh tomato salsa & sour cream in a soft shell corn taco',
  'Vegetarian',
  'salads-tapas',
  'SALADS & TAPAS PLATES',
  'plated',
  TRUE,
  38
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'plated-sal-4',
  'Cold Tofu',
  '330',
  'Silken tofu, cucumber, spring onion with house peanut sauce & chilli oil',
  'Vegan',
  'salads-tapas',
  'SALADS & TAPAS PLATES',
  'plated',
  TRUE,
  39
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'plated-knead-1',
  'BANH MI Tofu',
  '530',
  'Silken tofu banh mi with pickled veggies, coriander, roasted peanuts, and house sauces',
  'Vegan',
  'kneaded-gathered',
  'KNEADED & GATHERED',
  'plated',
  TRUE,
  40
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'plated-knead-2',
  'Kimchi Cheese Grilled Sandwich',
  '490',
  'House-made kimchi, cheddar & mozzarella grilled to perfection in country sourdough',
  'Vegetarian',
  'kneaded-gathered',
  'KNEADED & GATHERED',
  'plated',
  TRUE,
  41
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'plated-knead-3',
  'Thecha Cheese Grilled Sandwich',
  '490',
  'House-made thecha, cheddar & mozzarella grilled to perfection in country sourdough',
  'Vegetarian',
  'kneaded-gathered',
  'KNEADED & GATHERED',
  'plated',
  TRUE,
  42
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'plated-knead-4',
  'Artisanal Butter Board',
  '430',
  'Country sourdough bread with house artisanal butters (herbed butter, cashew miso butter, cacao berry butter)',
  'Vegetarian',
  'kneaded-gathered',
  'KNEADED & GATHERED',
  'plated',
  TRUE,
  43
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'plated-knead-5',
  'Hummus and Pita',
  '430',
  'Creamy hummus + olive chimichurri with freshly baked pita, pickled veggies and chilli',
  'Vegan',
  'kneaded-gathered',
  'KNEADED & GATHERED',
  'plated',
  TRUE,
  44
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'plated-sweet-1',
  'Tiramisu',
  '530',
  'Espresso-soaked ladyfingers layered with mascarpone cream & cocoa dust',
  'Vegetarian',
  'sweet-ends',
  'SWEET ENDS',
  'plated',
  TRUE,
  45
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'plated-sweet-2',
  'Black Rice Kheer',
  '390',
  'Slow-cooked black rice in coconut milk topped with kesar keri compote',
  'Vegan',
  'sweet-ends',
  'SWEET ENDS',
  'plated',
  TRUE,
  46
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
INSERT INTO public.menu_items (
  id, name, price, description, tag, category_id, category_title, menu_type, in_stock, sort_order
) VALUES (
  'plated-sweet-3',
  'Basque Cheesecake',
  '490',
  'Creamy cheesecake with vanilla bean and a caramelised crust',
  'Vegetarian',
  'sweet-ends',
  'SWEET ENDS',
  'plated',
  TRUE,
  47
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  menu_type = EXCLUDED.menu_type,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- 4. EVENTS (5 items)
INSERT INTO public.events (
  id, title, type, date, time, description, performers, venue, published, poster_image, spots
) VALUES (
  'event-weekender-day1',
  'Weekender at MRDĀ — Day 1: Caffeinia & DJ Set',
  'Tasting & Music',
  '2026-10-31',
  '4:00 PM – 9:30 PM',
  'Afternoon coffee session with Binny Varghese followed by Kadaknath B2B Add A White Petal electronic DJ set (House, Electro, Techno).',
  'Binny Varghese, Kadaknath B2B Add A White Petal',
  'The Sunlit Courtyard & Colonnade, The Claywalls, Thaltej',
  TRUE,
  '/assets/aistudio/event-2_d4128536.jpg',
  'Open Entry from 4:00 PM'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  type = EXCLUDED.type,
  date = EXCLUDED.date,
  time = EXCLUDED.time,
  description = EXCLUDED.description,
  performers = EXCLUDED.performers,
  venue = EXCLUDED.venue,
  published = EXCLUDED.published,
  poster_image = EXCLUDED.poster_image,
  spots = EXCLUDED.spots,
  updated_at = NOW();
INSERT INTO public.events (
  id, title, type, date, time, description, performers, venue, published, poster_image, spots
) VALUES (
  'event-weekender-day2',
  'Weekender at MRDĀ — Day 2: Samvaad & DJ Set',
  'Dialogue & Music',
  '2026-11-01',
  '4:00 PM – 9:30 PM',
  'Samvaad on Sustainability with Ms. Mansi Shah & Herin followed by Anisha live DJ set (House, Breaks, Bass, Garage, Electro).',
  'Ms. Mansi Shah, Herin, Anisha',
  'The Sunlit Courtyard & Amphitheatre, The Claywalls, Thaltej',
  TRUE,
  '/assets/aistudio/event-3_dfd9a2cc.jpg',
  'Open Entry from 4:00 PM'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  type = EXCLUDED.type,
  date = EXCLUDED.date,
  time = EXCLUDED.time,
  description = EXCLUDED.description,
  performers = EXCLUDED.performers,
  venue = EXCLUDED.venue,
  published = EXCLUDED.published,
  poster_image = EXCLUDED.poster_image,
  spots = EXCLUDED.spots,
  updated_at = NOW();
INSERT INTO public.events (
  id, title, type, date, time, description, performers, venue, published, poster_image, spots
) VALUES (
  'event-cupping',
  'Single-Origin Coffee Cupping',
  'Tasting & Sensory',
  'Alternate Saturdays',
  '10:00 AM – 11:30 AM',
  'A guided sensory exploration of 5 micro-lots from Chikmagalur, Araku Valley, and Ethiopia. Learn fragrance, aroma, acidity, and mouthfeel with our head roaster.',
  'MRDĀ Head Roaster',
  'The Brew Bar Counter',
  TRUE,
  '/MDRA/featured/ref_events.jpg',
  '10 spots per session'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  type = EXCLUDED.type,
  date = EXCLUDED.date,
  time = EXCLUDED.time,
  description = EXCLUDED.description,
  performers = EXCLUDED.performers,
  venue = EXCLUDED.venue,
  published = EXCLUDED.published,
  poster_image = EXCLUDED.poster_image,
  spots = EXCLUDED.spots,
  updated_at = NOW();
INSERT INTO public.events (
  id, title, type, date, time, description, performers, venue, published, poster_image, spots
) VALUES (
  'event-manual-brew',
  'The Art of Manual Brewing',
  'Hands-on Workshop',
  'Monthly, Sunday',
  '4:00 PM – 6:00 PM',
  'Demystifying the V60, Chemex, and Aeropress. Grind geometry, water temperatures, pouring rhythm, and extraction yields for brewing extraordinary coffee at home.',
  'Senior Barista Team',
  'The Courtyard',
  TRUE,
  '/MDRA/featured/menu_cold_brew.jpg',
  '8 spots per session'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  type = EXCLUDED.type,
  date = EXCLUDED.date,
  time = EXCLUDED.time,
  description = EXCLUDED.description,
  performers = EXCLUDED.performers,
  venue = EXCLUDED.venue,
  published = EXCLUDED.published,
  poster_image = EXCLUDED.poster_image,
  spots = EXCLUDED.spots,
  updated_at = NOW();
INSERT INTO public.events (
  id, title, type, date, time, description, performers, venue, published, poster_image, spots
) VALUES (
  'event-salon',
  'Claywalls Salon: Stories from the Soil',
  'Community & Dialogue',
  'Third Thursday of the Month',
  '7:00 PM – 9:00 PM',
  'An intimate evening gathering at the communal table featuring local ceramists, architects, botanists, and storytellers sharing work inspired by the Ahmedabad earth.',
  'Guest Artists & Authors',
  'Communal Table & Colonnade',
  TRUE,
  '/MDRA/images/cafe/cafe-8.jpg',
  'Open seating'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  type = EXCLUDED.type,
  date = EXCLUDED.date,
  time = EXCLUDED.time,
  description = EXCLUDED.description,
  performers = EXCLUDED.performers,
  venue = EXCLUDED.venue,
  published = EXCLUDED.published,
  poster_image = EXCLUDED.poster_image,
  spots = EXCLUDED.spots,
  updated_at = NOW();

-- 5. AUDIT LOGS (15 initial entries)
INSERT INTO public.audit_logs (
  id, action, admin_id, admin_name, timestamp, details, affected_id, override_reason
) VALUES (
  'audit-1793798320586-0soc',
  'TEST_VERIFICATION',
  'admin-1',
  'Café Owner',
  '2026-11-04T13:18:40.586Z'::timestamptz,
  'In-process audit log verification',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_logs (
  id, action, admin_id, admin_name, timestamp, details, affected_id, override_reason
) VALUES (
  'audit-1793552228099-cjxf',
  'ADMIN_LOGIN',
  'admin-3',
  'Manager / Staff',
  '2026-11-01T16:57:08.099Z'::timestamptz,
  'Administrator Manager / Staff (supervisor@atmrda.com) logged in from IP 127.0.0.1',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_logs (
  id, action, admin_id, admin_name, timestamp, details, affected_id, override_reason
) VALUES (
  'audit-1793552228034-xhcr',
  'ADMIN_LOGIN',
  'admin-3',
  'Manager / Staff',
  '2026-11-01T16:57:08.034Z'::timestamptz,
  'Administrator Manager / Staff (supervisor@atmrda.com) logged in from IP 127.0.0.1',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_logs (
  id, action, admin_id, admin_name, timestamp, details, affected_id, override_reason
) VALUES (
  'audit-1793552227976-4dit',
  'ADMIN_LOGIN',
  'admin-2',
  'Order Desk',
  '2026-11-01T16:57:07.976Z'::timestamptz,
  'Administrator Order Desk (operations@atmrda.com) logged in from IP 127.0.0.1',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_logs (
  id, action, admin_id, admin_name, timestamp, details, affected_id, override_reason
) VALUES (
  'audit-1793552227911-8jcd',
  'ADMIN_LOGIN',
  'admin-2',
  'Order Desk',
  '2026-11-01T16:57:07.911Z'::timestamptz,
  'Administrator Order Desk (operations@atmrda.com) logged in from IP 127.0.0.1',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_logs (
  id, action, admin_id, admin_name, timestamp, details, affected_id, override_reason
) VALUES (
  'audit-1793552227845-ad4o',
  'ADMIN_LOGIN',
  'admin-1',
  'Café Owner',
  '2026-11-01T16:57:07.845Z'::timestamptz,
  'Administrator Café Owner (admin@atmrda.com) logged in from IP 127.0.0.1',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_logs (
  id, action, admin_id, admin_name, timestamp, details, affected_id, override_reason
) VALUES (
  'audit-1793552117351-ol83',
  'DELETE_RESERVATION',
  'admin-1',
  'Café Owner',
  '2026-11-01T16:55:17.351Z'::timestamptz,
  'Deleted reservation MRD-3941 for E2E Multi-Admin Verification Guest (UPDATED)',
  'res-1793552117319-uo6i',
  NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_logs (
  id, action, admin_id, admin_name, timestamp, details, affected_id, override_reason
) VALUES (
  'audit-1793552117336-2824',
  'RESERVATION_UPDATE',
  'admin-3',
  'Manager / Staff',
  '2026-11-01T16:55:17.336Z'::timestamptz,
  'Updated reservation MRD-3941 for E2E Multi-Admin Verification Guest (UPDATED) (2026-11-05 4:30 PM, 4 guests)',
  'res-1793552117319-uo6i',
  NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_logs (
  id, action, admin_id, admin_name, timestamp, details, affected_id, override_reason
) VALUES (
  'audit-1793552117321-fb7z',
  'ADMIN_BOOKING_OVERRIDE',
  'admin-2',
  'Order Desk',
  '2026-11-01T16:55:17.321Z'::timestamptz,
  'Created reservation MRD-3941 for E2E Multi-Admin Verification Guest (2026-11-05 2:00 PM)',
  'res-1793552117319-uo6i',
  'Multi-Account Verification'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_logs (
  id, action, admin_id, admin_name, timestamp, details, affected_id, override_reason
) VALUES (
  'audit-1793552116953-p5ul',
  'ADMIN_LOGIN',
  'admin-3',
  'Manager / Staff',
  '2026-11-01T16:55:16.953Z'::timestamptz,
  'Administrator Manager / Staff (supervisor@atmrda.com) logged in from IP 127.0.0.1',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_logs (
  id, action, admin_id, admin_name, timestamp, details, affected_id, override_reason
) VALUES (
  'audit-1793552116883-6vil',
  'ADMIN_LOGIN',
  'admin-3',
  'Manager / Staff',
  '2026-11-01T16:55:16.883Z'::timestamptz,
  'Administrator Manager / Staff (supervisor@atmrda.com) logged in from IP 127.0.0.1',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_logs (
  id, action, admin_id, admin_name, timestamp, details, affected_id, override_reason
) VALUES (
  'audit-1793552116739-monl',
  'ADMIN_LOGIN',
  'admin-2',
  'Order Desk',
  '2026-11-01T16:55:16.739Z'::timestamptz,
  'Administrator Order Desk (operations@atmrda.com) logged in from IP 127.0.0.1',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_logs (
  id, action, admin_id, admin_name, timestamp, details, affected_id, override_reason
) VALUES (
  'audit-1793552116662-uumj',
  'ADMIN_LOGIN',
  'admin-2',
  'Order Desk',
  '2026-11-01T16:55:16.662Z'::timestamptz,
  'Administrator Order Desk (operations@atmrda.com) logged in from IP 127.0.0.1',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_logs (
  id, action, admin_id, admin_name, timestamp, details, affected_id, override_reason
) VALUES (
  'audit-1793552116503-zohw',
  'ADMIN_LOGIN',
  'admin-1',
  'Café Owner',
  '2026-11-01T16:55:16.503Z'::timestamptz,
  'Administrator Café Owner (admin@atmrda.com) logged in from IP 127.0.0.1',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_logs (
  id, action, admin_id, admin_name, timestamp, details, affected_id, override_reason
) VALUES (
  'audit-1793552116434-9x86',
  'ADMIN_LOGIN',
  'admin-1',
  'Café Owner',
  '2026-11-01T16:55:16.434Z'::timestamptz,
  'Administrator Café Owner (admin@atmrda.com) logged in from IP 127.0.0.1',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;
