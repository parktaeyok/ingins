"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { memberClient } from "@/lib/supabase/browser";
import { BOARD_PUBLIC_FIELDS, boardDate, boardError, boardIdSchema, type BoardPost } from "@/lib/board";

export function BoardDetail(){
  const id=useSearchParams().get("id");
  const router=useRouter();
  const [post,setPost]=useState<BoardPost|null>(null);
  const [owner,setOwner]=useState(false);
  const [loading,setLoading]=useState(true);
  const [pending,setPending]=useState(false);
  const [error,setError]=useState("");
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{
    let alive=true;
    async function load(){
      setLoading(true);setError("");setPost(null);setOwner(false);
      try{
        if(!boardIdSchema.safeParse(id).success)throw new Error("게시글 주소가 올바르지 않습니다.");
        const client=memberClient();if(!client)throw new Error("게시판에 연결할 수 없습니다. 잠시 후 다시 방문해주세요.");
        const {data:{user}}=await client.auth.getUser();
        const {data,error:queryError}=await client.from("site_board_posts").select(user?`${BOARD_PUBLIC_FIELDS},author_id`:BOARD_PUBLIC_FIELDS).eq("id",id).maybeSingle();
        if(queryError)throw new Error(boardError(queryError.code));
        if(!data)throw new Error("삭제되었거나 존재하지 않는 게시글입니다.");
        if(alive){const value=data as unknown as BoardPost;setPost(value);setOwner(Boolean(user&&value.author_id===user.id));}
      }catch(caught){if(alive)setError(caught instanceof Error?caught.message:boardError());}
      finally{if(alive)setLoading(false);}
    }
    void load();return()=>{alive=false;};
  },[id]);
  async function remove(){
    if(pending||!post)return;setPending(true);setError("");
    try{
      const client=memberClient();if(!client)throw new Error(boardError());
      const {data:{user}}=await client.auth.getUser();if(!user)throw new Error("다시 로그인한 뒤 시도해주세요.");
      const {data,error:deleteError}=await client.from("site_board_posts").delete().eq("id",post.id).eq("author_id",user.id).select("id");
      if(deleteError)throw new Error(boardError(deleteError.code));
      if(!data?.length)throw new Error("게시글이 없거나 삭제 권한이 없습니다.");
      router.replace("/board/");
    }catch(caught){setError(caught instanceof Error?caught.message:boardError());dialog.current?.close();}
    finally{setPending(false);}
  }
  return <><Link className="board-back" href="/board/">← 게시판 목록</Link>{loading?<p className="board-state" role="status">게시글을 불러오고 있습니다.</p>:post?<article className="board-detail"><p className="eyebrow">Community</p><h1>{post.title}</h1><p className="board-meta"><span>작성자 {post.author_username}</span><time dateTime={post.created_at}>{boardDate(post.created_at)}</time>{post.updated_at!==post.created_at&&<span>수정됨</span>}</p><div className="board-body">{post.body}</div>{owner&&<div className="board-actions"><Link className="button button--outline" href={`/board/write/?id=${post.id}`}>수정</Link><button className="button board-delete" onClick={()=>dialog.current?.showModal()}>삭제</button></div>}</article>:null}{error&&<p className="board-error" role="alert">{error}</p>}<dialog className="board-dialog" ref={dialog} aria-labelledby="delete-title" onCancel={event=>{if(pending)event.preventDefault();}}><h2 id="delete-title">게시글을 삭제할까요?</h2><p>삭제한 글은 복구할 수 없습니다.</p><div className="board-actions"><button className="button button--outline" autoFocus disabled={pending} onClick={()=>dialog.current?.close()}>취소</button><button className="button board-delete" disabled={pending} onClick={()=>void remove()}>{pending?"삭제 중…":"삭제하기"}</button></div></dialog></>;
}
