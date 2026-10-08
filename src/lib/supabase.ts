import { createClient, SupabaseClient } from "@supabase/supabase-js";

function cleanSupabaseUrl(url: string): string {
  let clean = url.trim();
  clean = clean.replace(/\/rest\/v1\/?$/, "");
  clean = clean.replace(/\/+$/, "");
  return clean;
}

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseUrl = cleanSupabaseUrl(rawSupabaseUrl);
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === "string" &&
    supabaseUrl.trim().length > 0 &&
    !supabaseUrl.includes("your-project") &&
    typeof (supabaseServiceKey || supabaseAnonKey) === "string" &&
    (supabaseServiceKey || supabaseAnonKey).trim().length > 0 &&
    !(supabaseServiceKey || supabaseAnonKey).includes("your-")
  );
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseInstance) {
    const key = supabaseServiceKey || supabaseAnonKey;
    supabaseInstance = createClient(supabaseUrl, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseInstance;
};
