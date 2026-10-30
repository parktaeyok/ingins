import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { MEMBER_PROJECT_URL } from "@/lib/member-project";
import { supabaseServerConfig, SupabaseServerConfigError } from "@/lib/supabase-server-config";
import { boardOperationSchema } from "@/lib/board";
import { accessBoard, BoardAccessError, type BoardAccessStore } from "@/lib/board-access";
import { hashBoardPassword, verifyBoardPassword } from "@/lib/board-password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store, max-age=0" };
class BoardStorageError extends Error {
  stage: string;
  code: string;
  constructor(stage:string,code:string){super("Board storage unavailable");this.stage=stage;this.code=code;}
}
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) throw new BoardAccessError(403, "허용되지 않은 요청입니다.");
    if (Number(request.headers.get("content-length") ?? 0) > 64000) throw new BoardAccessError(413, "입력 내용이 너무 깁니다.");
    const text = await request.text();
    if (text.length > 30000) throw new BoardAccessError(413, "입력 내용이 너무 깁니다.");
    const parsed = boardOperationSchema.safeParse(JSON.parse(text));
    if (!parsed.success) throw new BoardAccessError(422, parsed.error.issues[0].message);
    const config=supabaseServerConfig({url:process.env.SUPABASE_URL,publicUrl:process.env.NEXT_PUBLIC_SUPABASE_URL,key:process.env.SUPABASE_SECRET_KEY},MEMBER_PROJECT_URL);
    const admin = createSupabaseAdmin();
    const token = request.headers.get("authorization")?.replace(/^Bearer /i, "");
    let userId: string | null = null;
    if (token) {
      const { data, error } = await admin.auth.getUser(token);
      if (error || !data.user) throw new BoardAccessError(401, "로그인 상태를 확인한 뒤 다시 시도해주세요.");
      userId = data.user.id;
    }
    const store: BoardAccessStore = {
      async load(id) {
        const { data, error, status } = await admin.from("site_board_posts").select("id,author_id,title,body,author_username,created_at,updated_at,password_hash").eq("id",id).maybeSingle();
        if (error) throw new BoardStorageError("load",error.code||`HTTP_${status}`);
        return data;
      },
      async create(value) {
        const { data, error, status } = await admin.from("site_board_posts").insert(value).select("id").single();
        if (error || !data) throw new BoardStorageError("create",error?.code||`HTTP_${status}`);
        return data.id;
      },
      async update(id,owner,value) {
        const { data, error, status } = await admin.from("site_board_posts").update(value).eq("id",id).eq("author_id",owner).select("id");
        if (error) throw new BoardStorageError("update",error.code||`HTTP_${status}`);
        return Boolean(data?.length);
      },
      async remove(id,owner) {
        const { data, error, status } = await admin.from("site_board_posts").delete().eq("id",id).eq("author_id",owner).select("id");
        if (error) throw new BoardStorageError("delete",error.code||`HTTP_${status}`);
        return Boolean(data?.length);
      },
      async setInitialPassword(id,owner,hash) {
        const { data, error, status } = await admin.from("site_board_posts").update({password_hash:hash}).eq("id",id).eq("author_id",owner).is("password_hash",null).select("id");
        if (error) throw new BoardStorageError("set_password",error.code||`HTTP_${status}`);
        return Boolean(data?.length);
      },
      async attempt(key,reset) {
        const { data, error, status } = await admin.rpc("board_password_attempt", { p_key:key,p_reset:reset });
        if (error) throw new BoardStorageError("limiter",error.code||`HTTP_${status}`);
        return data === true;
      },
    };
    const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const postId = "id" in parsed.data ? parsed.data.id : "create";
    const attemptKey = createHmac("sha256",config.key).update(`${postId}|${address}`).digest("hex");
    const result = await accessBoard(parsed.data,userId,store,{hash:hashBoardPassword,verify:verifyBoardPassword},attemptKey);
    return NextResponse.json(result,{headers});
  } catch (error) {
    const status = error instanceof BoardAccessError ? error.status : error instanceof SyntaxError ? 400 : 503;
    const code=error instanceof SupabaseServerConfigError?error.code:error instanceof BoardStorageError?`BOARD_${error.stage.toUpperCase()}_${error.code}`:"BOARD_UNAVAILABLE";
    if(status===503)console.error("board_request_failed",{code,stage:error instanceof BoardStorageError?error.stage:"configuration_or_runtime"});
    const message = error instanceof BoardAccessError ? error.message : status === 400 ? "요청 형식을 확인해주세요." : `게시판 서버 연결을 확인하지 못했습니다. 운영자에게 오류 코드 ${code}를 알려주세요.`;
    return NextResponse.json({error:message,...(status===503?{code}:{})},{status,headers:{...headers,...(status===429?{"Retry-After":"600"}:{})}});
  }
}
