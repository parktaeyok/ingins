import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { usernameSchema } from "@/lib/registration";
import { createLoginLimiter, loginByUsername } from "@/lib/username-login";
import { MEMBER_PROJECT_URL, normalizeMemberUrl } from "@/lib/member-project";

export const runtime = "nodejs";
const allowAttempt = createLoginLimiter();
const headers = { "Cache-Control": "no-store" };
const invalid = () => NextResponse.json({ error: "아이디 또는 비밀번호를 확인해주세요." }, { status: 401, headers });

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "허용되지 않은 요청입니다." }, { status: 403, headers });
  try {
    const text = await request.text();
    if (text.length > 2048) return invalid();
    const body = JSON.parse(text);
    const username = usernameSchema.safeParse(body?.username);
    if (!username.success || typeof body?.password !== "string" || !body.password.length || body.password.length > 128) return invalid();
    if (!allowAttempt(username.data)) return NextResponse.json({ error: "로그인 시도가 많습니다. 1분 후 다시 시도해주세요." }, { status: 429, headers: { ...headers, "Retry-After": "60" } });
    const url = normalizeMemberUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
    if (url !== MEMBER_PROJECT_URL || !key || !process.env.SUPABASE_SECRET_KEY || normalizeMemberUrl(process.env.SUPABASE_URL) !== url) throw new Error("configuration");
    const admin = createSupabaseAdmin();
    const auth = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    const session = await loginByUsername(username.data, body.password, {
      async findUserId(name) {
        const { data, error } = await admin.from("registration_handles").select("user_id").eq("username", name).maybeSingle();
        if (error) throw new Error("lookup");
        return data?.user_id ?? null;
      },
      async findEmail(id) {
        const { data, error } = await admin.auth.admin.getUserById(id);
        if (error) throw new Error("lookup");
        return data.user.email ?? null;
      },
      async authenticate(email, password) {
        const { data, error } = await auth.auth.signInWithPassword({ email, password });
        if (error) return null;
        return data.session;
      },
    });
    return session ? NextResponse.json({ session }, { headers }) : invalid();
  } catch (error) {
    if (error instanceof SyntaxError) return invalid();
    // Never log credentials, contact information, tokens, or upstream error bodies.
    return NextResponse.json({ error: "로그인 연결을 확인하지 못했습니다. 잠시 후 다시 시도해주세요." }, { status: 503, headers });
  }
}
