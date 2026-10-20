import { NextRequest, NextResponse } from "next/server";
import { apiFailure, communityClient, CommunityError, parseBody } from "@/lib/community-server";
import { profileSchema } from "@/lib/community-schemas";

export async function GET(request: NextRequest) {
  try {
    const client = communityClient(request);
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user || user.is_anonymous) throw new CommunityError("로그인이 필요합니다.", 401);
    const { data, error: queryError } = await client.from("member_profiles").select("*").eq("id", user.id).maybeSingle();
    if (queryError) throw new CommunityError("회원 데이터 설정을 확인해주세요.", 503);
    return NextResponse.json({ profile: data, email: user.email });
  } catch (error) { return apiFailure(error); }
}
export async function POST(request: NextRequest) {
  try {
    const client = communityClient(request);
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user || user.is_anonymous || !user.email_confirmed_at) throw new CommunityError("이메일 인증 후 로그인해주세요.", 401);
    const input = await parseBody(request, profileSchema);
    const body = { ...input, full_name: input.display_name };
    const { data: existing, error: lookupError } = await client.from("member_profiles").select("id, active").eq("id", user.id).maybeSingle();
    if (lookupError) throw new CommunityError("회원 데이터 설정을 확인해주세요.", 503);
    if (existing && !existing.active) throw new CommunityError("이용이 중지된 회원입니다.", 403);
    const query = existing ? client.from("member_profiles").update(body).eq("id", user.id) : client.from("member_profiles").insert({ id: user.id, ...body });
    const { data, error: writeError } = await query.select().single();
    if (writeError) throw new CommunityError("회원 정보를 저장하지 못했습니다.", 400);
    return NextResponse.json({ profile: data });
  } catch (error) { return apiFailure(error); }
}
