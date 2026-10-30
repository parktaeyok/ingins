import { createClient } from "@supabase/supabase-js";
import { supabaseServerConfig } from "@/lib/supabase-server-config";

export function createSupabaseAdmin() {
  const {url,key}=supabaseServerConfig({url:process.env.SUPABASE_URL,publicUrl:process.env.NEXT_PUBLIC_SUPABASE_URL,key:process.env.SUPABASE_SECRET_KEY});
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
}
