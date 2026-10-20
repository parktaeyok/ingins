import { NextRequest, NextResponse } from "next/server";
import { apiFailure, communityClient, CommunityError, requireMember, parseBody } from "@/lib/community-server";
import { postSchema } from "@/lib/community-schemas";

export async function GET(request: NextRequest) {
  try {
    const client = communityClient(request);
    const page = Math.max(1, Math.min(10000, Math.trunc(Number(request.nextUrl.searchParams.get("page"))) || 1));
    const search = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 100).replace(/[\\%_]/g, "");
    const board = request.nextUrl.searchParams.get("board");
    let query = client.from("community_posts").select("id,board_id,title,author_name,author_id,created_at,updated_at", { count: "exact" });
    if (board) query = query.eq("board_id", board);
    if (search) query = query.ilike("title", `%${search}%`);
    const { data, error, count } = await query.order("created_at", { ascending: false }).order("id", { ascending: false }).range((page - 1) * 10, page * 10 - 1);
    if (error) throw new CommunityError("게시글을 불러오지 못했습니다.", 503);
    return NextResponse.json({ posts: data, total: count ?? 0, page });
  } catch (error) { return apiFailure(error); }
}
export async function POST(request: NextRequest) {
  try {
    const { client, user, profile } = await requireMember(request);
    const body = await parseBody(request, postSchema);
    const { data, error } = await client.from("community_posts").insert({ ...body, author_id: user.id, author_name: profile.display_name }).select("id").single();
    if (error) throw new CommunityError("작성 권한 또는 게시판 상태를 확인해주세요.", 403);
    return NextResponse.json({ post: data }, { status: 201 });
  } catch (error) { return apiFailure(error); }
}
