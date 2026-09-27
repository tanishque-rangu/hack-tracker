import { createBrowserClient } from '@supabase/ssr';

const DEFAULT_SUPABASE_URL = "https://omzcycyutoswlmbqyasj.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_RKAdX8Y1q2xGRSPg4FTIXg_eG4kMDXy";

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error("Failed to initialize Supabase browser client:", err);
    return null;
  }
}

