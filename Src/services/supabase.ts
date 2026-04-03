import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy singleton — never call createClient with placeholder/missing values
let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (_client) return _client;

  const url = (import.meta.env.VITE_SUPABASE_URL as string) ?? '';
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? '';

  if (!url || !key || url.includes('placeholder') || key.includes('placeholder') || url.length < 10) {
    return null;
  }

  try {
    _client = createClient(url, key);
    return _client;
  } catch (e) {
    console.warn('[Supabase] Failed to initialize client:', e);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  const url = (import.meta.env.VITE_SUPABASE_URL as string) ?? '';
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? '';
  return url.length > 10 && key.length > 10 && !url.includes('placeholder');
}

// Keep backward compat — but this is now null when not configured
// Use getSupabaseClient() in all service code instead
export const supabase = { getClient: getSupabaseClient };
