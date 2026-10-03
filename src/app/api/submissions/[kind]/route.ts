import { createHmac, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { isSubmissionKind, submissionSchemas } from "@/lib/submissions";

export async function POST(request: NextRequest, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (!isSubmissionKind(kind)) return NextResponse.json({ message: "지원하지 않는 신청 유형입니다." }, { status: 404 });
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 20_000) return NextResponse.json({ message: "요청 내용이 너무 큽니다." }, { status: 413 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "요청 형식을 확인해주세요." }, { status: 400 }); }
  const parsed = submissionSchemas[kind].safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "입력 내용을 확인해주세요." }, { status: 422 });
  if (parsed.data.website) return NextResponse.json({ receipt: `INS-${kind[0].toUpperCase()}-${Date.now()}-${randomBytes(3).toString("hex").toUpperCase()}` });
  const fingerprintSecret = process.env.SUBMISSION_FINGERPRINT_SECRET;
  if (!fingerprintSecret) return NextResponse.json({ message: "신청 저장 설정을 확인해주세요." }, { status: 503 });
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
  const fingerprint = createHmac("sha256", fingerprintSecret).update(`${forwarded}|${request.headers.get("user-agent") ?? ""}`).digest("hex");
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase.rpc("submit_public_request", { p_kind: kind, p_payload: parsed.data, p_fingerprint: fingerprint });
    if (error) { if (error.message.includes("RATE_LIMITED")) return NextResponse.json({ message: "잠시 후 다시 신청해주세요." }, { status: 429 }); throw error; }
    return NextResponse.json({ receipt: data });
  } catch (error) {
    console.error("Public submission failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ message: "신청을 저장하지 못했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }
}
