import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { memberPublicConfig } from "@/lib/member-project";
let client: SupabaseClient | null = null;
export function memberClient() {
  const config = memberPublicConfig(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  if (!config) return null;
  client ??= createClient(config.url, config.key);
  return client;
}
