import { createClient } from "@supabase/supabase-js";
import { normalizeMemberUrl } from "@/lib/member-project";

export function createSupabaseAdmin() {
  const url = normalizeMemberUrl(process.env.SUPABASE_URL);
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !secretKey) throw new Error("Supabase server environment is not configured.");
  return createClient(url, secretKey, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
}
