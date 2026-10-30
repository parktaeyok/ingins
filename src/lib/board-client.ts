import { memberClient } from "@/lib/supabase/browser";
import type { BoardPost } from "@/lib/board";
import type { BoardOperation } from "@/lib/board-access";
export async function boardRequest(value: BoardOperation): Promise<{ id?: string; post?: BoardPost }> {
  const client=memberClient();if(!client)throw new Error("게시판 연결을 확인해주세요.");
  const {data:{session}}=await client.auth.getSession();
  const response=await fetch("/api/board/",{method:"POST",headers:{"Content-Type":"application/json",...(session?{Authorization:`Bearer ${session.access_token}`}:{})},body:JSON.stringify(value),cache:"no-store"});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||"요청을 처리하지 못했습니다.");
  return data;
}
