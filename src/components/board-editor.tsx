"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { memberClient } from "@/lib/supabase/browser";
import { boardError, boardIdSchema, boardPostSchema } from "@/lib/board";

export function BoardEditor(){
  const id=useSearchParams().get("id");
  const router=useRouter();
  const [title,setTitle]=useState("");
  const [body,setBody]=useState("");
  const [ready,setReady]=useState(false);
  const [allowed,setAllowed]=useState(false);
  const [signedIn,setSignedIn]=useState(false);
  const [pending,setPending]=useState(false);
  const [error,setError]=useState("");
  useEffect(()=>{
    let alive=true;
    async function load(){
      setReady(false);setAllowed(false);setError("");setTitle("");setBody("");
      try{
        const client=memberClient();if(!client)throw new Error("게시판에 연결할 수 없습니다. 잠시 후 다시 방문해주세요.");
        const {data:{user}}=await client.auth.getUser();
        if(!alive)return;setSignedIn(Boolean(user));if(!user)return;
        if(id){
          if(!boardIdSchema.safeParse(id).success)throw new Error("게시글 주소가 올바르지 않습니다.");
          const {data,error:queryError}=await client.from("site_board_posts").select("title,body,author_id").eq("id",id).maybeSingle();
          if(queryError)throw new Error(boardError(queryError.code));
          if(!data||data.author_id!==user.id)throw new Error("본인이 작성한 게시글만 수정할 수 있습니다.");
          if(alive){setTitle(data.title);setBody(data.body);}
        }
        if(alive)setAllowed(true);
      }catch(caught){if(alive)setError(caught instanceof Error?caught.message:boardError());}
      finally{if(alive)setReady(true);}
    }
    void load();return()=>{alive=false;};
  },[id]);
  async function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(pending||!allowed)return;
    const parsed=boardPostSchema.safeParse({title,body});setError("");
    if(!parsed.success){setError(parsed.error.issues[0].message);return;}
    setPending(true);
    try{
      const client=memberClient();if(!client)throw new Error(boardError());
      const {data:{user}}=await client.auth.getUser();if(!user)throw new Error("다시 로그인한 뒤 작성해주세요.");
      const request=id?client.from("site_board_posts").update(parsed.data).eq("id",id).eq("author_id",user.id):client.from("site_board_posts").insert({...parsed.data,author_id:user.id});
      const {data,error:saveError}=await request.select("id").maybeSingle();
      if(saveError)throw new Error(saveError.code==="P0001"?"회원 정보 등록을 완료한 뒤 작성해주세요.":boardError(saveError.code));
      if(!data)throw new Error("게시글이 없거나 저장 권한이 없습니다.");
      router.replace(`/board/post/?id=${data.id}`);
    }catch(caught){setError(caught instanceof Error?caught.message:boardError());}
    finally{setPending(false);}
  }
  return <><Link className="board-back" href="/board/">← 게시판 목록</Link><div className="board-editor-heading"><p className="eyebrow">Community</p><h1>{id?"게시글 수정":"게시글 작성"}</h1><p>내용은 누구나 읽을 수 있습니다. 개인정보나 비밀정보를 입력하지 마세요.</p></div>{!ready?<p role="status">작성 권한을 확인하고 있습니다.</p>:!signedIn&&!error?<div className="board-state"><p>로그인한 회원만 글을 작성할 수 있습니다.</p><Link className="button button--primary" href="/login/">로그인</Link> <Link className="button button--outline" href="/signup/">회원가입</Link></div>:allowed?<form className="board-editor" onSubmit={save}><fieldset disabled={pending}><legend className="sr-only">게시글 내용</legend><label htmlFor="post-title">제목</label><input id="post-title" value={title} onChange={event=>setTitle(event.target.value)} minLength={2} maxLength={120} required autoFocus/><label htmlFor="post-body">내용</label><textarea id="post-body" value={body} onChange={event=>setBody(event.target.value)} minLength={2} maxLength={10000} rows={14} required aria-describedby="post-length"/><p id="post-length" className="board-count">{body.length.toLocaleString("ko-KR")} / 10,000자 · 일반 텍스트로 저장됩니다.</p></fieldset><div className="board-actions"><button className="button button--primary" disabled={pending}>{pending?"저장 중…":id?"수정 완료":"등록하기"}</button><Link className="button button--outline" href={id?`/board/post/?id=${id}`:"/board/"}>취소</Link></div></form>:null}{error&&<p className="board-error" role="alert">{error}</p>}</>;
}
