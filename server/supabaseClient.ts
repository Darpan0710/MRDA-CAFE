import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase configuration
// Note: SUPABASE_SERVICE_ROLE_KEY is private and must NEVER be exposed to the browser.
let cachedAdminClient: SupabaseClient | null = null;

function getSupabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL;
}

function getSupabaseServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

/**
 * Returns true if both Supabase URL and Service Role Key are provided with non-empty values.
 */
export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();
  return Boolean(
    url &&
    key &&
    url.trim() !== '' &&
    key.trim() !== '' &&
    !url.includes('your-project') &&
    !key.includes('your-service-role')
  );
}

/**
 * Server-only Supabase admin client powered by the service-role key.
 * Bypasses Row Level Security (RLS) for trusted administrative backend operations.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!cachedAdminClient) {
    const url = getSupabaseUrl()!;
    const key = getSupabaseServiceRoleKey()!;
    cachedAdminClient = createClient(url.trim(), key.trim(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return cachedAdminClient;
}
