import { createClient } from '@supabase/supabase-js';

// Configuration keys for local storage overrides
export const SUPABASE_URL_KEY = 'cmon_piket_supabase_url';
export const SUPABASE_ANON_KEY = 'cmon_piket_supabase_anon_key';

export interface SupabaseConfig {
  url: string | null;
  anonKey: string | null;
  source: 'env' | 'localStorage' | 'none';
}

export function getSupabaseConfig(): SupabaseConfig {
  // Check process.env first (Next.js server-side or build time)
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;
  let source: 'env' | 'localStorage' | 'none' = url && anonKey ? 'env' : 'none';

  // Check localStorage if in client-side
  if (typeof window !== 'undefined' && source === 'none') {
    const localUrl = localStorage.getItem(SUPABASE_URL_KEY);
    const localKey = localStorage.getItem(SUPABASE_ANON_KEY);
    if (localUrl && localKey) {
      url = localUrl;
      anonKey = localKey;
      source = 'localStorage';
    }
  }

  return { url, anonKey, source };
}

export function getSupabaseClient() {
  const { url, anonKey } = getSupabaseConfig();
  if (url && anonKey) {
    try {
      return createClient(url, anonKey);
    } catch (e) {
      console.error('Failed to create Supabase client:', e);
      return null;
    }
  }
  return null;
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SUPABASE_URL_KEY, url);
    localStorage.setItem(SUPABASE_ANON_KEY, anonKey);
  }
}

export function clearSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SUPABASE_URL_KEY);
    localStorage.removeItem(SUPABASE_ANON_KEY);
  }
}
