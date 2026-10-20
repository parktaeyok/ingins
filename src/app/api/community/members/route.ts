import { NextRequest, NextResponse } from "next/server";
import { apiFailure, CommunityError, requireMember, parseBody } from "@/lib/community-server";
import { memberStateSchema } from "@/lib/community-schemas";

export async function GET(request: NextRequest) {
  try {
    const { client } = await requireMember(request, true);
    const page = Math.max(1, Math.min(10000, Math.trunc(Number(request.nextUrl.searchParams.get("page"))) || 1));
    const { data, error, count } = await client.from("member_profiles").select("*", { count: "exact" }).order("created_at", { ascending: false }).order("id").range((page - 1) * 20, page * 20 - 1);
    if (error) throw new CommunityError("회원 목록을 불러오지 못했습니다.", 503);
    return NextResponse.json({ members: data, total: count ?? 0 });
  } catch (error) { return apiFailure(error); }
}
export async function PATCH(request: NextRequest) {
  try {
    const { client, user } = await requireMember(request, true);
    const body = await parseBody(request, memberStateSchema);
    if (body.id === user.id) throw new CommunityError("본인의 이용 상태는 변경할 수 없습니다.", 400);
    const { data, error } = await client.from("member_profiles").update({ active: body.active }).eq("id", body.id).eq("role", "member").select("id").maybeSingle();
    if (error || !data) throw new CommunityError("일반 회원의 상태만 변경할 수 있습니다.", 400);
    return NextResponse.json({ updated: true });
  } catch (error) { return apiFailure(error); }
}
