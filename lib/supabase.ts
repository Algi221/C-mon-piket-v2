import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration keys for local storage overrides
export const SUPABASE_URL_KEY = 'cmon_piket_supabase_url';
export const SUPABASE_ANON_KEY = 'cmon_piket_supabase_anon_key';

// Default project credentials provided by the user
export const DEFAULT_SUPABASE_URL = 'https://fwkjimrgrfplohxzdrzl.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_tYoantD9fJ2zAioBpGWfxQ_k2phlPPw';

export interface SupabaseConfig {
  url: string | null;
  anonKey: string | null;
  source: 'env' | 'localStorage' | 'default' | 'none';
}

export function getSupabaseConfig(): SupabaseConfig {
  // 1. Check process.env first
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;
  let source: 'env' | 'localStorage' | 'default' | 'none' = url && anonKey ? 'env' : 'none';

  // 2. Check localStorage if in client-side
  if (typeof window !== 'undefined' && source === 'none') {
    const localUrl = localStorage.getItem(SUPABASE_URL_KEY);
    const localKey = localStorage.getItem(SUPABASE_ANON_KEY);
    if (localUrl && localKey) {
      url = localUrl;
      anonKey = localKey;
      source = 'localStorage';
    }
  }

  // 3. Fallback to default user-provided Supabase project credentials
  if (source === 'none') {
    url = DEFAULT_SUPABASE_URL;
    anonKey = DEFAULT_SUPABASE_ANON_KEY;
    source = 'default';
  }

  return { url, anonKey, source };
}

let cachedClient: SupabaseClient | null = null;
let cachedUrl: string | null = null;
let cachedKey: string | null = null;

export function getSupabaseClient() {
  const { url, anonKey } = getSupabaseConfig();
  if (url && anonKey) {
    if (cachedClient && cachedUrl === url && cachedKey === anonKey) {
      return cachedClient;
    }
    try {
      cachedClient = createClient(url, anonKey);
      cachedUrl = url;
      cachedKey = anonKey;
      return cachedClient;
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
