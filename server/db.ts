
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { ALLOWED_TIME_SLOTS } from './dateUtils';

// Load environment variables (.env.local takes precedence, falls back to .env)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  name: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  syncedEnvPasswordHash?: string;
  syncedEnvEmail?: string;
}

export interface Session {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface Reservation {
  id: string;
  reference: string;
  name: string;
  phone: string;
  email?: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 AM"
  guests: string;
  zone: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface BlockedSlot {
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 AM"
  reason?: string;
  createdAt: string;
}

export interface BlockedDate {
  date: string; // YYYY-MM-DD
  reason?: string;
  createdAt: string;
}

export interface MenuItemRecord {
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

export interface EventRecord {
  id: string;
  title: string;
  type: string;
  date: string; // e.g. "2026-10-31" or "Alternate Saturdays"
  time: string; // e.g. "4:00 PM – 9:30 PM"
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

export interface AuditLogRecord {
  id: string;
  action: string;
  adminId: string;
  adminName: string;
  timestamp: string;
  details: string;
  affectedId?: string;
  overrideReason?: string;
}

export interface DatabaseSchema {
  adminUser: AdminUser;
  adminUsers: AdminUser[];
  sessions: Session[];
  reservations: Reservation[];
  blockedSlots: BlockedSlot[];
  blockedDates: BlockedDate[];
  menuItems: MenuItemRecord[];
  events: EventRecord[];
  settings: CafeSettings;
  auditLogs?: AuditLogRecord[];
}

const DB_PATH = path.resolve(process.cwd(), 'data', 'mrda_db.json');

// Helper to hash password using scrypt
export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

// Timing-safe password verification
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computedHash = hashPassword(password, salt);
    const hashBuf = Buffer.from(hash, 'hex');
    const computedBuf = Buffer.from(computedHash, 'hex');
    if (hashBuf.length !== computedBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, computedBuf);
  } catch (e) {
    return false;
  }
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Compute a deterministic SHA-256 fingerprint of an environment credential
// Used to safely detect when .env.local has been edited without storing plaintext
export function getSecretFingerprint(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

// Session signing secret (server-side only)
function getSessionSigningSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.ADMIN_PASSWORD_1 ||
    process.env.ADMIN_PASSWORD ||
    'mrda_secure_admin_session_key_2026'
  );
}

// Generates a cryptographically signed URL-safe session token
// Valid statelessly across serverless lambdas (e.g. Vercel) and locally
export function createSignedSessionToken(userId: string, expiresAt: string, passwordHash?: string): string {
  const secret = getSessionSigningSecret();
  const pwdCheck = passwordHash ? passwordHash.substring(0, 16) : '';
  const payloadStr = JSON.stringify({
    userId,
    expiresAt,
    p: pwdCheck,
    nonce: crypto.randomBytes(16).toString('hex'),
  });
  const payloadB64 = Buffer.from(payloadStr, 'utf-8').toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
  return `mrda_${payloadB64}.${signature}`;
}

// Verifies a cryptographically signed session token
export function verifySignedSessionToken(token: string): { userId: string; expiresAt: string; passwordHashCheck?: string } | null {
  try {
    if (!token || !token.startsWith('mrda_')) return null;
    const parts = token.substring(5).split('.');
    if (parts.length !== 2) return null;
    const [payloadB64, signature] = parts;
    const secret = getSessionSigningSecret();
    const expectedSig = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const parsed = JSON.parse(payloadJson);
    if (!parsed.userId || !parsed.expiresAt) return null;
    return {
      userId: parsed.userId,
      expiresAt: parsed.expiresAt,
      passwordHashCheck: parsed.p,
    };
  } catch {
    return null;
  }
}

// Generate secure initial admin accounts from environment variables (2 active accounts)
function createInitialAdminUsers(): AdminUser[] {
  const now = new Date().toISOString();
  const configs = [
    {
      id: 'admin-1',
      username: process.env.ADMIN_USERNAME_1 || process.env.ADMIN_USERNAME || 'admin',
      email: (process.env.ADMIN_EMAIL_1 || process.env.ADMIN_EMAIL || 'admin@atmrda.com').toLowerCase(),
      password: process.env.ADMIN_PASSWORD_1 || process.env.ADMIN_PASSWORD,
      name: 'Café Owner',
    },
    {
      id: 'admin-2',
      username: process.env.ADMIN_USERNAME_2 || process.env.STAFF_USERNAME || 'cafe',
      email: (process.env.ADMIN_EMAIL_2 || process.env.STAFF_EMAIL || 'staff@atmrda.com').toLowerCase(),
      password: process.env.ADMIN_PASSWORD_2 || process.env.STAFF_PASSWORD,
      name: 'Café & Staff',
    },
  ];

  return configs.map((cfg) => {
    const salt = generateSalt();
    // Use env password if present; otherwise generate a cryptographically strong random fallback
    const rawPass = cfg.password || crypto.randomBytes(24).toString('base64');
    return {
      id: cfg.id,
      username: cfg.username,
      email: cfg.email,
      passwordHash: hashPassword(rawPass, salt),
      salt,
      name: cfg.name,
      createdAt: now,
      updatedAt: now,
      syncedEnvPasswordHash: cfg.password ? getSecretFingerprint(cfg.password) : undefined,
      syncedEnvEmail: cfg.email,
    };
  });
}

// Initial seed data
function getInitialSeed(): DatabaseSchema {
  const initialAdmins = createInitialAdminUsers();

  const initialMenu: MenuItemRecord[] = [
    // POURED - SIGNATURES
    {
      id: 'poured-sig-1',
      name: 'Orange Jalapeno (The OJ)',
      price: 360,
      description: 'Malta orange concentrate, fresh jalapeno, Thai basil & lemon',
      tag: 'Specialty',
      categoryId: 'signatures',
      categoryTitle: 'SIGNATURES',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-sig-2',
      name: 'Garden Puff',
      price: 360,
      description: 'Fresh cucumber, housemade rosemary cordial, smoked dried rosemary',
      tag: 'Specialty',
      categoryId: 'signatures',
      categoryTitle: 'SIGNATURES',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-sig-3',
      name: 'Dal Stock Xchange',
      price: 390,
      description: 'If you figure it out, pls let us know',
      tag: 'Specialty',
      categoryId: 'signatures',
      categoryTitle: 'SIGNATURES',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-sig-4',
      name: 'Bees & Beans',
      price: 390,
      description: 'Single origin espresso, raw unprocessed ajwain honey, tonic water',
      tag: 'Caffeinated',
      categoryId: 'signatures',
      categoryTitle: 'SIGNATURES',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-sig-5',
      name: 'Purple Sea',
      price: 390,
      description: 'Steeped lavender buds infused with butterfly pea flowers, macerated pineapple, 100% dairy cream cloud, orange zest',
      tag: 'Specialty',
      categoryId: 'signatures',
      categoryTitle: 'SIGNATURES',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-sig-6',
      name: 'Bloody Jasmine',
      price: 390,
      description: 'Steeped Jasmine Pearl Tea, fermented Falsa juice, lemon zest, raw & unprocessed Himalayan forest honey, dairy cream cloud',
      tag: 'Specialty',
      categoryId: 'signatures',
      categoryTitle: 'SIGNATURES',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-sig-7',
      name: 'Penicillin',
      price: 390,
      description: 'Single origin espresso, ginger honey potion, organic raw sugar, housemade soda',
      tag: 'Caffeinated',
      categoryId: 'signatures',
      categoryTitle: 'SIGNATURES',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-sig-8',
      name: 'Espresso Sour',
      price: 390,
      description: 'Single origin espresso, housemade mix spice syrup, raw & unprocessed Himalayan forest honey',
      tag: 'Caffeinated',
      categoryId: 'signatures',
      categoryTitle: 'SIGNATURES',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-sig-9',
      name: 'Sun & Soil',
      price: 390,
      description: 'Macerated pineapple, housemade fermented pineapple vinegar, coconut water, coconut cream',
      tag: 'Specialty',
      categoryId: 'signatures',
      categoryTitle: 'SIGNATURES',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-sig-10',
      name: 'Soul Kaaphi',
      price: 430,
      description: 'Inspired by solkadhi, a drink for your soul',
      tag: 'Specialty',
      categoryId: 'signatures',
      categoryTitle: 'SIGNATURES',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-sig-11',
      name: 'London Fog',
      price: 430,
      description: 'Steeped earl grey tea, organic milk, housemade vanilla bean syrup finished with dried lavender buds',
      tag: 'Specialty',
      categoryId: 'signatures',
      categoryTitle: 'SIGNATURES',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-sig-12',
      name: 'Oatcino',
      price: 430,
      description: 'Single origin espresso, organic coconut sugar & oatmilk',
      tag: 'Vegan',
      categoryId: 'signatures',
      categoryTitle: 'SIGNATURES',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // POURED - SLOW BREWED
    {
      id: 'poured-slow-1',
      name: 'Classic Cold Brew',
      price: 260,
      description: '18-hour cold steeped single-origin roast',
      tag: 'Caffeinated',
      categoryId: 'slow-brewed',
      categoryTitle: 'SLOW BREWED',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-slow-2',
      name: 'Ginger Ajwain Cold Brew',
      price: 290,
      description: 'Infused with fresh crushed ginger and carom seeds',
      tag: 'Caffeinated',
      categoryId: 'slow-brewed',
      categoryTitle: 'SLOW BREWED',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-slow-3',
      name: 'Coconut Cold Brew',
      price: 330,
      description: 'Layered with tender coconut water',
      tag: 'Caffeinated',
      categoryId: 'slow-brewed',
      categoryTitle: 'SLOW BREWED',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-slow-4',
      name: 'V60 Pour Over (Indian Beans)',
      price: 360,
      description: 'Precision filtered single estate beans',
      tag: 'Caffeinated',
      categoryId: 'slow-brewed',
      categoryTitle: 'SLOW BREWED',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-slow-5',
      name: 'V60 Pour Over (International Beans)',
      price: 490,
      description: 'Rotating world micro-lots',
      tag: 'Caffeinated',
      categoryId: 'slow-brewed',
      categoryTitle: 'SLOW BREWED',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-slow-6',
      name: 'Chemex',
      price: '360 / 490',
      description: 'Clean, tea-like aromatic cup',
      tag: 'Caffeinated',
      categoryId: 'slow-brewed',
      categoryTitle: 'SLOW BREWED',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // POURED - GROUNDED & SHIFTED
    {
      id: 'poured-ground-1',
      name: 'Espresso (Hot / Iced)',
      price: '190 / 210',
      description: 'Double shot single-origin extraction',
      tag: 'Caffeinated',
      categoryId: 'grounded',
      categoryTitle: 'GROUNDED & SHIFTED',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-ground-2',
      name: 'Americano (Hot / Iced)',
      price: '210 / 230',
      description: 'Espresso over hot water or ice',
      tag: 'Caffeinated',
      categoryId: 'grounded',
      categoryTitle: 'GROUNDED & SHIFTED',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-ground-3',
      name: 'Cortado (Hot / Iced)',
      price: '230 / 250',
      description: 'Equal parts espresso and warm textured milk',
      tag: 'Caffeinated',
      categoryId: 'grounded',
      categoryTitle: 'GROUNDED & SHIFTED',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-ground-4',
      name: 'Cappuccino',
      price: 260,
      description: 'Velvety microfoam over double espresso',
      tag: 'Caffeinated',
      categoryId: 'grounded',
      categoryTitle: 'GROUNDED & SHIFTED',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-ground-5',
      name: 'Café Latte (Hot / Iced)',
      price: '260 / 280',
      description: 'Smooth, comforting classic',
      tag: 'Caffeinated',
      categoryId: 'grounded',
      categoryTitle: 'GROUNDED & SHIFTED',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-ground-6',
      name: 'Flat White',
      price: 260,
      description: 'Thin layer of microfoam, rich double shot',
      tag: 'Caffeinated',
      categoryId: 'grounded',
      categoryTitle: 'GROUNDED & SHIFTED',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-ground-7',
      name: 'Spanish Latte (Hot / Iced)',
      price: '360 / 390',
      description: 'Sweetened condensed milk, espresso, fresh milk',
      tag: 'Caffeinated',
      categoryId: 'grounded',
      categoryTitle: 'GROUNDED & SHIFTED',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-ground-8',
      name: 'Affogato',
      price: 390,
      description: 'Double espresso poured over artisanal vanilla gelato',
      tag: 'Specialty',
      categoryId: 'grounded',
      categoryTitle: 'GROUNDED & SHIFTED',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // POURED - MATCHA & TEAS
    {
      id: 'poured-tea-1',
      name: 'Usucha (Matcha)',
      price: 460,
      description: 'Traditional thin ceremonial whisked tea from Kagoshima',
      tag: 'Specialty',
      categoryId: 'matcha-tea',
      categoryTitle: 'MATCHA, HOJICHA & TEAS',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-tea-2',
      name: 'Matcha Latte (Hot / Iced)',
      price: '510 / 530',
      description: 'Kagoshima matcha whisked with oat or whole milk',
      tag: 'Specialty',
      categoryId: 'matcha-tea',
      categoryTitle: 'MATCHA, HOJICHA & TEAS',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-tea-3',
      name: 'Coconut Matcha Cooler',
      price: 590,
      description: 'Tender coconut water, coconut foam, ceremonial matcha',
      tag: 'Specialty',
      categoryId: 'matcha-tea',
      categoryTitle: 'MATCHA, HOJICHA & TEAS',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'poured-tea-4',
      name: 'Iced Hojicha Latte',
      price: 360,
      description: 'Deep smoky aroma & caramelised undertones',
      tag: 'Specialty',
      categoryId: 'matcha-tea',
      categoryTitle: 'MATCHA, HOJICHA & TEAS',
      menuType: 'poured',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // PLATED - DAYBREAK & FRENCH TOASTS
    {
      id: 'plated-day-1',
      name: 'Milk Oats',
      price: 330,
      description: 'Rolled oats in wild forest honey milk, topped with banana, frozen berry jam, seeds & coconut',
      tag: 'Vegetarian',
      categoryId: 'daybreak',
      categoryTitle: 'DAYBREAK & FRENCH TOASTS',
      menuType: 'plated',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'plated-day-2',
      name: 'Tadka Buttermilk Oats',
      price: 330,
      description: 'Ghee tempered buttermilk soaked oats with chia seeds, coriander & pomegranate pearls',
      tag: 'Vegetarian',
      categoryId: 'daybreak',
      categoryTitle: 'DAYBREAK & FRENCH TOASTS',
      menuType: 'plated',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'plated-day-3',
      name: 'Paneer Bhurji Toast',
      price: 360,
      description: 'Paneer with peppers, aam kasundi & chilli guava butter with side of toasted sourdough, roasted sweet potato & slaw',
      tag: 'Vegetarian',
      categoryId: 'daybreak',
      categoryTitle: 'DAYBREAK & FRENCH TOASTS',
      menuType: 'plated',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'plated-day-4',
      name: 'Honey Nutmeg French Toast',
      price: 490,
      description: 'Wild forest honey, mascarpone cream & nutmeg',
      tag: 'Vegetarian',
      categoryId: 'daybreak',
      categoryTitle: 'DAYBREAK & FRENCH TOASTS',
      menuType: 'plated',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'plated-day-5',
      name: 'Strawberry French Toast',
      price: 490,
      description: 'House strawberry jam, mascarpone cream',
      tag: 'Vegetarian',
      categoryId: 'daybreak',
      categoryTitle: 'DAYBREAK & FRENCH TOASTS',
      menuType: 'plated',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // PLATED - SALADS & TAPAS
    {
      id: 'plated-sal-1',
      name: 'Soil & Season Salad',
      price: 430,
      description: "Chef-curated fruits of the season, inspired by the earth's freshest offerings",
      tag: 'Vegan',
      categoryId: 'salads-tapas',
      categoryTitle: 'SALADS & TAPAS PLATES',
      menuType: 'plated',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'plated-sal-2',
      name: 'Crispy Black Rice Salad',
      price: 460,
      description: 'Locally sourced crisped black rice, coconut cream dressing, veggies, roasted peanuts & sweet potato shreds',
      tag: 'Vegan',
      categoryId: 'salads-tapas',
      categoryTitle: 'SALADS & TAPAS PLATES',
      menuType: 'plated',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'plated-sal-3',
      name: 'Black Bean Tacos',
      price: 330,
      description: 'Single-origin black beans, fresh tomato salsa & sour cream in a soft shell corn taco',
      tag: 'Vegetarian',
      categoryId: 'salads-tapas',
      categoryTitle: 'SALADS & TAPAS PLATES',
      menuType: 'plated',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'plated-sal-4',
      name: 'Cold Tofu',
      price: 330,
      description: 'Silken tofu, cucumber, spring onion with house peanut sauce & chilli oil',
      tag: 'Vegan',
      categoryId: 'salads-tapas',
      categoryTitle: 'SALADS & TAPAS PLATES',
      menuType: 'plated',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // PLATED - KNEADED & GATHERED
    {
      id: 'plated-knead-1',
      name: 'BANH MI Tofu',
      price: 530,
      description: 'Silken tofu banh mi with pickled veggies, coriander, roasted peanuts, and house sauces',
      tag: 'Vegan',
      categoryId: 'kneaded-gathered',
      categoryTitle: 'KNEADED & GATHERED',
      menuType: 'plated',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'plated-knead-2',
      name: 'Kimchi Cheese Grilled Sandwich',
      price: 490,
      description: 'House-made kimchi, cheddar & mozzarella grilled to perfection in country sourdough',
      tag: 'Vegetarian',
      categoryId: 'kneaded-gathered',
      categoryTitle: 'KNEADED & GATHERED',
      menuType: 'plated',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'plated-knead-3',
      name: 'Thecha Cheese Grilled Sandwich',
      price: 490,
      description: 'House-made thecha, cheddar & mozzarella grilled to perfection in country sourdough',
      tag: 'Vegetarian',
      categoryId: 'kneaded-gathered',
      categoryTitle: 'KNEADED & GATHERED',
      menuType: 'plated',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'plated-knead-4',
      name: 'Artisanal Butter Board',
      price: 430,
      description: 'Country sourdough bread with house artisanal butters (herbed butter, cashew miso butter, cacao berry butter)',
      tag: 'Vegetarian',
      categoryId: 'kneaded-gathered',
      categoryTitle: 'KNEADED & GATHERED',
      menuType: 'plated',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'plated-knead-5',
      name: 'Hummus and Pita',
      price: 430,
      description: 'Creamy hummus + olive chimichurri with freshly baked pita, pickled veggies and chilli',
      tag: 'Vegan',
      categoryId: 'kneaded-gathered',
      categoryTitle: 'KNEADED & GATHERED',
      menuType: 'plated',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // PLATED - SWEET ENDS
    {
      id: 'plated-sweet-1',
      name: 'Tiramisu',
      price: 530,
      description: 'Espresso-soaked ladyfingers layered with mascarpone cream & cocoa dust',
      tag: 'Vegetarian',
      categoryId: 'sweet-ends',
      categoryTitle: 'SWEET ENDS',
      menuType: 'plated',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'plated-sweet-2',
      name: 'Black Rice Kheer',
      price: 390,
      description: 'Slow-cooked black rice in coconut milk topped with kesar keri compote',
      tag: 'Vegan',
      categoryId: 'sweet-ends',
      categoryTitle: 'SWEET ENDS',
      menuType: 'plated',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'plated-sweet-3',
      name: 'Basque Cheesecake',
      price: 490,
      description: 'Creamy cheesecake with vanilla bean and a caramelised crust',
      tag: 'Vegetarian',
      categoryId: 'sweet-ends',
      categoryTitle: 'SWEET ENDS',
      menuType: 'plated',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const initialEvents: EventRecord[] = [
    {
      id: 'event-weekender-day1',
      title: 'Weekender at MRDĀ — Day 1: Caffeinia & DJ Set',
      type: 'Tasting & Music',
      date: '2026-10-31',
      time: '4:00 PM – 9:30 PM',
      description: 'Afternoon coffee session with Binny Varghese followed by Kadaknath B2B Add A White Petal electronic DJ set (House, Electro, Techno).',
      performers: 'Binny Varghese, Kadaknath B2B Add A White Petal',
      venue: 'The Sunlit Courtyard & Colonnade, The Claywalls, Thaltej',
      published: true,
      posterImage: '/assets/aistudio/event-2_d4128536.jpg',
      spots: 'Open Entry from 4:00 PM',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'event-weekender-day2',
      title: 'Weekender at MRDĀ — Day 2: Samvaad & DJ Set',
      type: 'Dialogue & Music',
      date: '2026-11-01',
      time: '4:00 PM – 9:30 PM',
      description: 'Samvaad on Sustainability with Ms. Mansi Shah & Herin followed by Anisha live DJ set (House, Breaks, Bass, Garage, Electro).',
      performers: 'Ms. Mansi Shah, Herin, Anisha',
      venue: 'The Sunlit Courtyard & Amphitheatre, The Claywalls, Thaltej',
      published: true,
      posterImage: '/assets/aistudio/event-3_dfd9a2cc.jpg',
      spots: 'Open Entry from 4:00 PM',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'event-cupping',
      title: 'Single-Origin Coffee Cupping',
      type: 'Tasting & Sensory',
      date: 'Alternate Saturdays',
      time: '10:00 AM – 11:30 AM',
      description: 'A guided sensory exploration of 5 micro-lots from Chikmagalur, Araku Valley, and Ethiopia. Learn fragrance, aroma, acidity, and mouthfeel with our head roaster.',
      performers: 'MRDĀ Head Roaster',
      venue: 'The Brew Bar Counter',
      published: true,
      posterImage: '/MDRA/featured/ref_events.jpg',
      spots: '10 spots per session',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'event-manual-brew',
      title: 'The Art of Manual Brewing',
      type: 'Hands-on Workshop',
      date: 'Monthly, Sunday',
      time: '4:00 PM – 6:00 PM',
      description: 'Demystifying the V60, Chemex, and Aeropress. Grind geometry, water temperatures, pouring rhythm, and extraction yields for brewing extraordinary coffee at home.',
      performers: 'Senior Barista Team',
      venue: 'The Courtyard',
      published: true,
      posterImage: '/MDRA/featured/menu_cold_brew.jpg',
      spots: '8 spots per session',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'event-salon',
      title: 'Claywalls Salon: Stories from the Soil',
      type: 'Community & Dialogue',
      date: 'Third Thursday of the Month',
      time: '7:00 PM – 9:00 PM',
      description: 'An intimate evening gathering at the communal table featuring local ceramists, architects, botanists, and storytellers sharing work inspired by the Ahmedabad earth.',
      performers: 'Guest Artists & Authors',
      venue: 'Communal Table & Colonnade',
      published: true,
      posterImage: '/MDRA/images/cafe/cafe-8.jpg',
      spots: 'Open seating',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return {
    adminUser: initialAdmins[0],
    adminUsers: initialAdmins,
    sessions: [],
    reservations: [],
    blockedSlots: [],
    blockedDates: [],
    menuItems: initialMenu,
    events: initialEvents,
    settings: {
      cafeName: 'MRDĀ',
      address: '6th Floor, Claywalls, Zydus Hospital Road, Opposite Verantes, Thaltej, Ahmedabad, Gujarat 380059, India',
      phone: '+91 87996 00369',
      hours: 'Mon - Sun | 8:00 AM - 10:00 PM',
      bookingCutoffHours: 2,
      maxPartySize: 12,
      defaultSlotCapacity: 20,
      autoConfirmReservations: true,
      timeSlots: [...ALLOWED_TIME_SLOTS],
    },
    auditLogs: [],
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_PATH)) {
        let raw = fs.readFileSync(DB_PATH, 'utf-8');
        if (raw.charCodeAt(0) === 0xFEFF) {
          raw = raw.slice(1);
        }
        const parsed = JSON.parse(raw);
        // Ensure all required top-level keys exist
        const seed = getInitialSeed();
        const loadedSettings = parsed.settings || seed.settings;
        // Strictly restrict timeSlots to 10:00 AM through 8:00 PM, removing 8:30 AM
        if (Array.isArray(loadedSettings.timeSlots)) {
          loadedSettings.timeSlots = loadedSettings.timeSlots.filter((slot: string) =>
            ALLOWED_TIME_SLOTS.includes(slot)
          );
          if (loadedSettings.timeSlots.length === 0) {
            loadedSettings.timeSlots = [...ALLOWED_TIME_SLOTS];
          }
        } else {
          loadedSettings.timeSlots = [...ALLOWED_TIME_SLOTS];
        }

        // Initialize or preserve exactly the 2 active admin accounts (admin-1 Owner, admin-2 Café & Staff)
        let loadedAdminUsers: AdminUser[] = [];
        let needsSave = false;

        const rawAdmins: AdminUser[] = Array.isArray(parsed.adminUsers)
          ? parsed.adminUsers
          : parsed.adminUser
          ? [parsed.adminUser]
          : [];

        // Deactivate admin-3 if present in existing database
        const hadAdmin3 = rawAdmins.some((u) => u.id === 'admin-3');
        if (hadAdmin3 || rawAdmins.length !== 2) {
          needsSave = true;
        }

        // Environment variables for Account 1 (Owner)
        const envEmail1 = (process.env.ADMIN_EMAIL_1 || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
        const envPassword1 = (process.env.ADMIN_PASSWORD_1 || process.env.ADMIN_PASSWORD || '').trim();
        const envUsername1 = (process.env.ADMIN_USERNAME_1 || process.env.ADMIN_USERNAME || '').trim();

        // Environment variables for Account 2 (Café & Staff)
        const envEmail2 = (process.env.ADMIN_EMAIL_2 || process.env.STAFF_EMAIL || '').trim().toLowerCase();
        const envPassword2 = (process.env.ADMIN_PASSWORD_2 || process.env.STAFF_PASSWORD || '').trim();
        const envUsername2 = (process.env.ADMIN_USERNAME_2 || process.env.STAFF_USERNAME || '').trim();

        const sessionsToInvalidate: string[] = [];

        // Account 1: Owner (admin-1)
        const existingAdmin1 = rawAdmins.find((u) => u.id === 'admin-1');
        let admin1: AdminUser;
        if (existingAdmin1) {
          admin1 = {
            ...existingAdmin1,
            id: 'admin-1',
            name: existingAdmin1.name || 'Café Owner',
            username: envUsername1 || existingAdmin1.username || 'admin',
          };

          // Synchronize Email from environment if changed in .env.local
          if (envEmail1 && envEmail1 !== admin1.email.toLowerCase()) {
            admin1.email = envEmail1;
            admin1.syncedEnvEmail = envEmail1;
            admin1.updatedAt = new Date().toISOString();
            needsSave = true;
          }

          // Synchronize Password from environment if changed in .env.local
          if (envPassword1) {
            const fingerprint = getSecretFingerprint(envPassword1);
            const matchesCurrent = verifyPassword(envPassword1, admin1.passwordHash, admin1.salt);
            const isEnvEdited = admin1.syncedEnvPasswordHash && admin1.syncedEnvPasswordHash !== fingerprint;
            const isUnsyncedLegacy = !admin1.syncedEnvPasswordHash && !matchesCurrent;
            const isForced = process.env.FORCE_ENV_CREDENTIALS === 'true' && !matchesCurrent;

            if (isEnvEdited || isUnsyncedLegacy || isForced) {
              const newSalt = generateSalt();
              admin1.salt = newSalt;
              admin1.passwordHash = hashPassword(envPassword1, newSalt);
              admin1.syncedEnvPasswordHash = fingerprint;
              admin1.syncedEnvEmail = admin1.email;
              admin1.updatedAt = new Date().toISOString();
              sessionsToInvalidate.push('admin-1');
              needsSave = true;
            } else if (!admin1.syncedEnvPasswordHash && matchesCurrent) {
              admin1.syncedEnvPasswordHash = fingerprint;
              admin1.syncedEnvEmail = admin1.email;
              needsSave = true;
            }
          }
        } else {
          const salt = generateSalt();
          const rawPass = envPassword1 || crypto.randomBytes(24).toString('base64');
          admin1 = {
            id: 'admin-1',
            username: envUsername1 || 'admin',
            email: envEmail1 || 'admin@atmrda.com',
            passwordHash: hashPassword(rawPass, salt),
            salt,
            name: 'Café Owner',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            syncedEnvPasswordHash: envPassword1 ? getSecretFingerprint(envPassword1) : undefined,
            syncedEnvEmail: envEmail1 || 'admin@atmrda.com',
          };
          needsSave = true;
        }

        // Account 2: Café & Staff (admin-2)
        const existingAdmin2 = rawAdmins.find((u) => u.id === 'admin-2');
        let admin2: AdminUser;
        if (existingAdmin2) {
          admin2 = {
            ...existingAdmin2,
            id: 'admin-2',
            name: 'Café & Staff',
            username: envUsername2 || (existingAdmin2.username === 'operations' ? 'cafe' : existingAdmin2.username),
          };

          // Synchronize Email from environment if changed in .env.local
          if (envEmail2 && envEmail2 !== admin2.email.toLowerCase()) {
            admin2.email = envEmail2;
            admin2.syncedEnvEmail = envEmail2;
            admin2.updatedAt = new Date().toISOString();
            needsSave = true;
          }

          // Synchronize Password from environment if changed in .env.local
          if (envPassword2) {
            const fingerprint = getSecretFingerprint(envPassword2);
            const matchesCurrent = verifyPassword(envPassword2, admin2.passwordHash, admin2.salt);
            const isEnvEdited = admin2.syncedEnvPasswordHash && admin2.syncedEnvPasswordHash !== fingerprint;
            const isUnsyncedLegacy = !admin2.syncedEnvPasswordHash && !matchesCurrent;
            const isForced = process.env.FORCE_ENV_CREDENTIALS === 'true' && !matchesCurrent;

            if (isEnvEdited || isUnsyncedLegacy || isForced) {
              const newSalt = generateSalt();
              admin2.salt = newSalt;
              admin2.passwordHash = hashPassword(envPassword2, newSalt);
              admin2.syncedEnvPasswordHash = fingerprint;
              admin2.syncedEnvEmail = admin2.email;
              admin2.updatedAt = new Date().toISOString();
              sessionsToInvalidate.push('admin-2');
              needsSave = true;
            } else if (!admin2.syncedEnvPasswordHash && matchesCurrent) {
              admin2.syncedEnvPasswordHash = fingerprint;
              admin2.syncedEnvEmail = admin2.email;
              needsSave = true;
            }
          }
        } else {
          const salt = generateSalt();
          const rawPass = envPassword2 || crypto.randomBytes(24).toString('base64');
          admin2 = {
            id: 'admin-2',
            username: envUsername2 || 'cafe',
            email: envEmail2 || 'staff@atmrda.com',
            passwordHash: hashPassword(rawPass, salt),
            salt,
            name: 'Café & Staff',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            syncedEnvPasswordHash: envPassword2 ? getSecretFingerprint(envPassword2) : undefined,
            syncedEnvEmail: envEmail2 || 'staff@atmrda.com',
          };
          needsSave = true;
        }

        loadedAdminUsers = [admin1, admin2];

        // Purge any active sessions for deactivated account admin-3 or accounts whose password changed in environment
        let validSessions: Session[] = Array.isArray(parsed.sessions)
          ? parsed.sessions.filter(
              (s: Session) =>
                (s.userId === 'admin-1' || s.userId === 'admin-2') &&
                !sessionsToInvalidate.includes(s.userId)
            )
          : [];
        if (Array.isArray(parsed.sessions) && validSessions.length !== parsed.sessions.length) {
          needsSave = true;
        }

        const primaryAdmin = loadedAdminUsers[0] || seed.adminUser;
        const resultData: DatabaseSchema = {
          adminUser: primaryAdmin,
          adminUsers: loadedAdminUsers,
          sessions: validSessions,
          reservations: Array.isArray(parsed.reservations) ? parsed.reservations : [],
          blockedSlots: Array.isArray(parsed.blockedSlots) ? parsed.blockedSlots : [],
          blockedDates: Array.isArray(parsed.blockedDates) ? parsed.blockedDates : [],
          menuItems: Array.isArray(parsed.menuItems) ? parsed.menuItems : seed.menuItems,
          events: Array.isArray(parsed.events) ? parsed.events : seed.events,
          settings: loadedSettings,
          auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
        };

        if (needsSave) {
          this.saveData(resultData);
        }

        return resultData;
      }
    } catch (e) {
      console.error('Error loading database, initializing new seed:', e);
    }

    const seed = getInitialSeed();
    this.saveData(seed);
    return seed;
  }

  private saveData(data: DatabaseSchema): void {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tempPath = `${DB_PATH}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_PATH);
    } catch (e) {
      console.warn(
        '[MRDĀ Database] Notice: Unable to persist to disk (expected on read-only serverless platforms like Vercel):',
        (e as Error).message
      );
    }
  }

  public save(): void {
    this.saveData(this.data);
  }

  public getAdmin(): AdminUser {
    return this.data.adminUsers?.[0] || this.data.adminUser;
  }

  public getAdminUsers(): AdminUser[] {
    return this.data.adminUsers || (this.data.adminUser ? [this.data.adminUser] : []);
  }

  public findAdminById(id?: string): AdminUser | null {
    if (!id) return null;
    const users = this.getAdminUsers();
    const active = users.find((u) => u.id === id);
    if (active) return active;
    // For historical audit trail logs that reference deactivated admin-3, provide historical display profile
    if (id === 'admin-3') {
      return {
        id: 'admin-3',
        username: 'supervisor',
        email: 'supervisor@atmrda.com',
        name: 'Manager / Staff (Archived)',
        passwordHash: '',
        salt: '',
        createdAt: '2026-10-01T00:00:00.000Z',
        updatedAt: '2026-10-01T00:00:00.000Z',
      };
    }
    return null;
  }

  public findAdminByEmailOrUsername(identifier: string): AdminUser | null {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    const users = this.getAdminUsers(); // exactly 2 active accounts: [admin-1, admin-2]

    // Direct match by username or email among active accounts
    const direct = users.find(
      (u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
    );
    if (direct) return direct;

    // Active Aliases:
    // 1. Owner -> admin-1
    if (['owner', 'admin'].includes(clean)) {
      return users.find((u) => u.id === 'admin-1') || null;
    }
    // 2. Café & Staff -> admin-2
    if (['cafe', 'café', 'staff', 'desk', 'orderdesk', 'team', 'barista', 'operations'].includes(clean)) {
      return users.find((u) => u.id === 'admin-2') || null;
    }

    // Obsolete supervisor/manager aliases or deactivated accounts return null
    return null;
  }

  public updateAdmin(
    idOrUpdates: string | Partial<AdminUser>,
    maybeUpdates?: Partial<AdminUser>
  ): AdminUser {
    let targetId: string;
    let updateData: Partial<AdminUser>;

    if (typeof idOrUpdates === 'string') {
      targetId = idOrUpdates;
      updateData = maybeUpdates || {};
    } else {
      targetId = this.data.adminUsers?.[0]?.id || this.data.adminUser?.id || 'admin-1';
      updateData = idOrUpdates;
    }

    const users = this.data.adminUsers || (this.data.adminUser ? [this.data.adminUser] : []);
    const idx = users.findIndex((u) => u.id === targetId);

    if (idx !== -1) {
      users[idx] = {
        ...users[idx],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      this.data.adminUsers = users;
      if (idx === 0) {
        this.data.adminUser = users[0];
      }
      this.save();
      return users[idx];
    }

    this.data.adminUser = {
      ...this.data.adminUser,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.adminUser;
  }

  // Sessions
  public createSession(userId: string): Session {
    // Purge expired sessions
    const now = new Date().getTime();
    this.data.sessions = this.data.sessions.filter(
      (s) => new Date(s.expiresAt).getTime() > now
    );

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h
    const admin = this.findAdminById(userId);
    const token = createSignedSessionToken(userId, expiresAt, admin?.passwordHash);

    const session: Session = {
      token,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt,
    };
    this.data.sessions.push(session);
    this.save();
    return session;
  }

  public getSession(token: string): Session | null {
    const now = new Date().getTime();
    // 1. Check in-memory / local storage first
    const inMemory = this.data.sessions.find(
      (s) => s.token === token && new Date(s.expiresAt).getTime() > now
    );
    if (inMemory) {
      return inMemory;
    }

    // 2. Stateless token verification fallback (essential for serverless lambdas on Vercel)
    const verified = verifySignedSessionToken(token);
    if (!verified) return null;
    if (new Date(verified.expiresAt).getTime() <= now) return null;

    const admin = this.findAdminById(verified.userId);
    if (!admin) return null;

    // Check that admin password has not changed since token was issued
    if (
      verified.passwordHashCheck &&
      admin.passwordHash &&
      verified.passwordHashCheck !== admin.passwordHash.substring(0, 16)
    ) {
      return null;
    }

    return {
      token,
      userId: verified.userId,
      createdAt: new Date(new Date(verified.expiresAt).getTime() - 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: verified.expiresAt,
    };
  }

  public deleteSession(token: string): void {
    this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
    this.save();
  }

  // Invalidate all active sessions for a specific admin account (e.g. after password change)
  public invalidateAdminSessions(userId: string): void {
    if (!this.data.sessions) this.data.sessions = [];
    const beforeCount = this.data.sessions.length;
    this.data.sessions = this.data.sessions.filter((s) => s.userId !== userId);
    if (this.data.sessions.length !== beforeCount) {
      this.save();
    }
  }

  /**
   * Synchronizes admin accounts with credentials defined in .env.local / environment.
   * Can be called explicitly at server boot or on demand.
   */
  public syncAdminCredentialsFromEnv(): { changed: boolean; updatedAccounts: string[] } {
    const envEmail1 = (process.env.ADMIN_EMAIL_1 || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const envPassword1 = (process.env.ADMIN_PASSWORD_1 || process.env.ADMIN_PASSWORD || '').trim();
    const envUsername1 = (process.env.ADMIN_USERNAME_1 || process.env.ADMIN_USERNAME || '').trim();

    const envEmail2 = (process.env.ADMIN_EMAIL_2 || process.env.STAFF_EMAIL || '').trim().toLowerCase();
    const envPassword2 = (process.env.ADMIN_PASSWORD_2 || process.env.STAFF_PASSWORD || '').trim();
    const envUsername2 = (process.env.ADMIN_USERNAME_2 || process.env.STAFF_USERNAME || '').trim();

    const users = this.getAdminUsers();
    const admin1 = users.find((u) => u.id === 'admin-1');
    const admin2 = users.find((u) => u.id === 'admin-2');

    let needsSave = false;
    const updatedAccounts: string[] = [];
    const sessionsToInvalidate: string[] = [];

    // Sync admin-1 (Owner)
    if (admin1) {
      if (envEmail1 && envEmail1 !== admin1.email.toLowerCase()) {
        const isEnvEdit = !admin1.syncedEnvEmail || admin1.syncedEnvEmail !== envEmail1;
        if (isEnvEdit) {
          admin1.email = envEmail1;
          admin1.syncedEnvEmail = envEmail1;
          admin1.updatedAt = new Date().toISOString();
          needsSave = true;
          updatedAccounts.push('admin-1 (email)');
        }
      }
      if (envUsername1 && envUsername1 !== admin1.username) {
        admin1.username = envUsername1;
        admin1.updatedAt = new Date().toISOString();
        needsSave = true;
      }
      if (envPassword1) {
        const fingerprint = getSecretFingerprint(envPassword1);
        const matchesCurrent = verifyPassword(envPassword1, admin1.passwordHash, admin1.salt);
        const isEnvEdit = admin1.syncedEnvPasswordHash && admin1.syncedEnvPasswordHash !== fingerprint;
        const isLegacyUnsynced = !admin1.syncedEnvPasswordHash && !matchesCurrent;
        const isForced = process.env.FORCE_ENV_CREDENTIALS === 'true' && !matchesCurrent;

        if (isEnvEdit || isLegacyUnsynced || isForced) {
          const newSalt = generateSalt();
          admin1.salt = newSalt;
          admin1.passwordHash = hashPassword(envPassword1, newSalt);
          admin1.syncedEnvPasswordHash = fingerprint;
          admin1.syncedEnvEmail = admin1.email;
          admin1.updatedAt = new Date().toISOString();
          sessionsToInvalidate.push('admin-1');
          needsSave = true;
          updatedAccounts.push('admin-1 (password)');
        } else if (!admin1.syncedEnvPasswordHash && matchesCurrent) {
          admin1.syncedEnvPasswordHash = fingerprint;
          admin1.syncedEnvEmail = admin1.email;
          needsSave = true;
        }
      }
    }

    // Sync admin-2 (Café & Staff)
    if (admin2) {
      if (envEmail2 && envEmail2 !== admin2.email.toLowerCase()) {
        const isEnvEdit = !admin2.syncedEnvEmail || admin2.syncedEnvEmail !== envEmail2;
        if (isEnvEdit) {
          admin2.email = envEmail2;
          admin2.syncedEnvEmail = envEmail2;
          admin2.updatedAt = new Date().toISOString();
          needsSave = true;
          updatedAccounts.push('admin-2 (email)');
        }
      }
      if (envUsername2 && envUsername2 !== admin2.username) {
        admin2.username = envUsername2;
        admin2.updatedAt = new Date().toISOString();
        needsSave = true;
      }
      if (envPassword2) {
        const fingerprint = getSecretFingerprint(envPassword2);
        const matchesCurrent = verifyPassword(envPassword2, admin2.passwordHash, admin2.salt);
        const isEnvEdit = admin2.syncedEnvPasswordHash && admin2.syncedEnvPasswordHash !== fingerprint;
        const isLegacyUnsynced = !admin2.syncedEnvPasswordHash && !matchesCurrent;
        const isForced = process.env.FORCE_ENV_CREDENTIALS === 'true' && !matchesCurrent;

        if (isEnvEdit || isLegacyUnsynced || isForced) {
          const newSalt = generateSalt();
          admin2.salt = newSalt;
          admin2.passwordHash = hashPassword(envPassword2, newSalt);
          admin2.syncedEnvPasswordHash = fingerprint;
          admin2.syncedEnvEmail = admin2.email;
          admin2.updatedAt = new Date().toISOString();
          sessionsToInvalidate.push('admin-2');
          needsSave = true;
          updatedAccounts.push('admin-2 (password)');
        } else if (!admin2.syncedEnvPasswordHash && matchesCurrent) {
          admin2.syncedEnvPasswordHash = fingerprint;
          admin2.syncedEnvEmail = admin2.email;
          needsSave = true;
        }
      }
    }

    if (sessionsToInvalidate.length > 0) {
      for (const id of sessionsToInvalidate) {
        this.invalidateAdminSessions(id);
      }
    }

    if (needsSave) {
      if (admin1) this.data.adminUser = admin1;
      this.data.adminUsers = [admin1!, admin2!].filter(Boolean);
      this.save();
      console.log(`[MRDĀ Admin Auth] Synchronized credentials from environment: ${updatedAccounts.join(', ')}`);
    }

    return { changed: needsSave, updatedAccounts };
  }

  // Reservations
  public getReservations(): Reservation[] {
    return [...this.data.reservations].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public addReservation(
    res: Omit<Reservation, 'id' | 'reference' | 'createdAt' | 'updatedAt'>
  ): Reservation {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const newReservation: Reservation = {
      ...res,
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      reference: `MRD-${rand}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.reservations.unshift(newReservation);
    this.save();
    return newReservation;
  }

  public getReservationById(id: string): Reservation | null {
    return this.data.reservations.find((r) => r.id === id) || null;
  }

  public updateReservation(
    id: string,
    updates: Partial<Omit<Reservation, 'id' | 'reference' | 'createdAt'>>
  ): Reservation | null {
    const res = this.data.reservations.find((r) => r.id === id);
    if (!res) return null;
    Object.assign(res, updates);
    res.updatedAt = new Date().toISOString();
    this.save();
    return res;
  }

  public updateReservationStatus(
    id: string,
    status: Reservation['status']
  ): Reservation | null {
    const res = this.data.reservations.find((r) => r.id === id);
    if (!res) return null;
    res.status = status;
    res.updatedAt = new Date().toISOString();
    this.save();
    return res;
  }

  public deleteReservation(id: string): boolean {
    const initialLen = this.data.reservations.length;
    this.data.reservations = this.data.reservations.filter((r) => r.id !== id);
    if (this.data.reservations.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Availability
  public getBlockedDates(): BlockedDate[] {
    return this.data.blockedDates;
  }

  public getBlockedSlots(): BlockedSlot[] {
    return this.data.blockedSlots;
  }

  public blockSlot(date: string, time: string, reason?: string): BlockedSlot {
    const existing = this.data.blockedSlots.find(
      (s) => s.date === date && s.time === time
    );
    if (existing) {
      existing.reason = reason;
      this.save();
      return existing;
    }
    const slot: BlockedSlot = {
      date,
      time,
      reason,
      createdAt: new Date().toISOString(),
    };
    this.data.blockedSlots.push(slot);
    this.save();
    return slot;
  }

  public unblockSlot(date: string, time: string): boolean {
    const initialLen = this.data.blockedSlots.length;
    this.data.blockedSlots = this.data.blockedSlots.filter(
      (s) => !(s.date === date && s.time === time)
    );
    if (this.data.blockedSlots.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public blockDate(date: string, reason?: string): BlockedDate {
    const existing = this.data.blockedDates.find((d) => d.date === date);
    if (existing) {
      existing.reason = reason;
      this.save();
      return existing;
    }
    const blocked: BlockedDate = {
      date,
      reason,
      createdAt: new Date().toISOString(),
    };
    this.data.blockedDates.push(blocked);
    this.save();
    return blocked;
  }

  public unblockDate(date: string): boolean {
    const initialLen = this.data.blockedDates.length;
    this.data.blockedDates = this.data.blockedDates.filter((d) => d.date !== date);
    if (this.data.blockedDates.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Menu Items
  public getMenuItems(): MenuItemRecord[] {
    return this.data.menuItems;
  }

  public addMenuItem(item: Omit<MenuItemRecord, 'id' | 'createdAt' | 'updatedAt'>): MenuItemRecord {
    const newItem: MenuItemRecord = {
      ...item,
      id: `menu-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.menuItems.push(newItem);
    this.save();
    return newItem;
  }

  public updateMenuItem(
    id: string,
    updates: Partial<Omit<MenuItemRecord, 'id' | 'createdAt' | 'updatedAt'>>
  ): MenuItemRecord | null {
    const item = this.data.menuItems.find((m) => m.id === id);
    if (!item) return null;
    Object.assign(item, updates);
    item.updatedAt = new Date().toISOString();
    this.save();
    return item;
  }

  public toggleItemStock(id: string): MenuItemRecord | null {
    const item = this.data.menuItems.find((m) => m.id === id);
    if (!item) return null;
    item.inStock = !item.inStock;
    item.updatedAt = new Date().toISOString();
    this.save();
    return item;
  }

  public deleteMenuItem(id: string): boolean {
    const initialLen = this.data.menuItems.length;
    this.data.menuItems = this.data.menuItems.filter((m) => m.id !== id);
    if (this.data.menuItems.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Events
  public getEvents(publishedOnly = false): EventRecord[] {
    if (publishedOnly) {
      return this.data.events.filter((e) => e.published);
    }
    return this.data.events;
  }

  public addEvent(event: Omit<EventRecord, 'id' | 'createdAt' | 'updatedAt'>): EventRecord {
    const newEvent: EventRecord = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.events.unshift(newEvent);
    this.save();
    return newEvent;
  }

  public updateEvent(
    id: string,
    updates: Partial<Omit<EventRecord, 'id' | 'createdAt' | 'updatedAt'>>
  ): EventRecord | null {
    const evt = this.data.events.find((e) => e.id === id);
    if (!evt) return null;
    Object.assign(evt, updates);
    evt.updatedAt = new Date().toISOString();
    this.save();
    return evt;
  }

  public toggleEventPublish(id: string): EventRecord | null {
    const evt = this.data.events.find((e) => e.id === id);
    if (!evt) return null;
    evt.published = !evt.published;
    evt.updatedAt = new Date().toISOString();
    this.save();
    return evt;
  }

  public deleteEvent(id: string): boolean {
    const initialLen = this.data.events.length;
    this.data.events = this.data.events.filter((e) => e.id !== id);
    if (this.data.events.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Settings
  public getSettings(): CafeSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<CafeSettings>): CafeSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates,
    };
    this.save();
    return this.data.settings;
  }

  // Audit Trail
  public getAuditLogs(limit = 50): AuditLogRecord[] {
    if (!this.data.auditLogs) this.data.auditLogs = [];
    return [...this.data.auditLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  public logAudit(entry: Omit<AuditLogRecord, 'id' | 'timestamp'>): AuditLogRecord {
    if (!this.data.auditLogs) this.data.auditLogs = [];
    const log: AuditLogRecord = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 200);
    }
    this.save();
    return log;
  }
}

export const db = new Database();
