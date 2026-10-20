import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { MEMBER_PROJECT_URL } from "@/lib/member-project";
let client: SupabaseClient | null = null;
export function memberClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url !== MEMBER_PROJECT_URL || !key) return null;
  client ??= createClient(url, key);
  return client;
}
