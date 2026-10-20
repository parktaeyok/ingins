import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";

export class CommunityError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export function communityClient(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new CommunityError("회원·게시판 연결 설정이 필요합니다.", 503);
  const authorization = request.headers.get("authorization");
  if (authorization && !/^Bearer [A-Za-z0-9._-]+$/.test(authorization)) throw new CommunityError("다시 로그인해주세요.", 401);
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: authorization ? { headers: { Authorization: authorization } } : undefined,
  });
}
export async function requireMember(request: NextRequest, admin = false) {
  const client = communityClient(request);
  if (!request.headers.has("authorization")) throw new CommunityError("로그인이 필요합니다.", 401);
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user || user.is_anonymous || !user.email_confirmed_at) throw new CommunityError("이메일 인증 후 다시 로그인해주세요.", 401);
  const { data: profile, error: profileError } = await client.from("member_profiles").select("*").eq("id", user.id).maybeSingle();
  if (profileError) throw new CommunityError("회원 정보를 확인하지 못했습니다.", 503);
  if (!profile) throw new CommunityError("내 정보에서 회원 정보를 등록해주세요.", 403);
  if (!profile.active) throw new CommunityError("이용이 중지된 회원입니다. 관리자에게 문의해주세요.", 403);
  if (admin && profile.role !== "admin") throw new CommunityError("관리자만 이용할 수 있습니다.", 403);
  return { client, user, profile };
}
export async function parseBody<T>(request: NextRequest, schema: z.ZodType<T>): Promise<T> {
  const body = await request.text();
  if (new TextEncoder().encode(body).length > 100000) throw new CommunityError("입력 내용이 너무 큽니다.", 413);
  let json: unknown;
  try { json = JSON.parse(body); } catch { throw new CommunityError("요청 형식을 확인해주세요.", 400); }
  const result = schema.safeParse(json);
  if (!result.success) throw new CommunityError("입력 길이와 필수 항목을 확인해주세요.", 422);
  return result.data;
}
export function apiFailure(error: unknown) {
  if (error instanceof CommunityError) return NextResponse.json({ message: error.message }, { status: error.status });
  console.error("Community request failed", error instanceof Error ? error.message : "unknown error");
  return NextResponse.json({ message: "요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
}
