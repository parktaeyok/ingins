import { NextRequest, NextResponse } from "next/server";
import { apiFailure, communityClient, CommunityError, requireMember, parseBody } from "@/lib/community-server";
import { boardSchema } from "@/lib/community-schemas";

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await communityClient(request).from("community_boards").select("*").eq("active", true).order("created_at");
    if (error) throw new CommunityError("게시판을 불러오지 못했습니다. 연결 설정을 확인해주세요.", 503);
    return NextResponse.json({ boards: data });
  } catch (error) { return apiFailure(error); }
}
export async function POST(request: NextRequest) {
  try {
    const { client } = await requireMember(request, true);
    const body = await parseBody(request, boardSchema);
    const { data, error } = await client.from("community_boards").insert(body).select().single();
    if (error) throw new CommunityError(error.code === "23505" ? "이미 사용 중인 게시판 주소입니다." : "게시판을 만들지 못했습니다.", 400);
    return NextResponse.json({ board: data }, { status: 201 });
  } catch (error) { return apiFailure(error); }
}
