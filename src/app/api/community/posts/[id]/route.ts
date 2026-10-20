import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiFailure, communityClient, CommunityError, requireMember, parseBody } from "@/lib/community-server";
import { postEditSchema } from "@/lib/community-schemas";
type Context = { params: Promise<{ id: string }> };
async function postId(context: Context) {
  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) throw new CommunityError("게시글을 찾을 수 없습니다.", 404);
  return id;
}
export async function GET(request: NextRequest, context: Context) {
  try {
    const id = await postId(context);
    const { data, error } = await communityClient(request).from("community_posts").select("*").eq("id", id).maybeSingle();
    if (error) throw new CommunityError("게시글을 불러오지 못했습니다.", 503);
    if (!data) throw new CommunityError("게시글을 찾을 수 없습니다.", 404);
    return NextResponse.json({ post: data });
  } catch (error) { return apiFailure(error); }
}
export async function PATCH(request: NextRequest, context: Context) {
  try {
    const id = await postId(context);
    const { client, user, profile } = await requireMember(request);
    const body = await parseBody(request, postEditSchema);
    let query = client.from("community_posts").update(body).eq("id", id);
    if (profile.role !== "admin") query = query.eq("author_id", user.id);
    const { data, error } = await query.select("id").maybeSingle();
    if (error || !data) throw new CommunityError("게시글이 없거나 수정 권한이 없습니다.", 403);
    return NextResponse.json({ post: data });
  } catch (error) { return apiFailure(error); }
}
export async function DELETE(request: NextRequest, context: Context) {
  try {
    const id = await postId(context);
    const { client, user, profile } = await requireMember(request);
    let query = client.from("community_posts").delete().eq("id", id);
    if (profile.role !== "admin") query = query.eq("author_id", user.id);
    const { data, error } = await query.select("id").maybeSingle();
    if (error || !data) throw new CommunityError("게시글이 없거나 삭제 권한이 없습니다.", 403);
    return NextResponse.json({ deleted: true });
  } catch (error) { return apiFailure(error); }
}
