import { createBrowserClient } from '@supabase/ssr';
import { getBrowserSupabaseAnonKey, getBrowserSupabaseUrl } from '@/lib/supabase-env';

export function supabaseBrowser() {
  return createBrowserClient(getBrowserSupabaseUrl(), getBrowserSupabaseAnonKey());
}
