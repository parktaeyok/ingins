import { getBrowserSupabase } from "@/lib/supabase/browser";

export async function communityApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const client = getBrowserSupabase();
  const { data } = client ? await client.auth.getSession() : { data: { session: null } };
  const headers = new Headers(init.headers);
  if (data.session) headers.set("Authorization", `Bearer ${data.session.access_token}`);
  if (init.body) headers.set("Content-Type", "application/json");
  const response = await fetch(`/api/community/${path}`, { ...init, headers, cache: "no-store" });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message ?? "요청을 처리하지 못했습니다.");
  return body as T;
}

export type MemberProfile = { id: string; display_name: string; company_name: string; role: "member" | "admin"; active: boolean; created_at: string };
export type Board = { id: string; slug: string; name: string; description: string; write_role: "member" | "admin"; active: boolean };
export type Post = { id: string; board_id: string; author_id: string; author_name: string; title: string; content: string; created_at: string; updated_at: string };
