"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { memberClient } from "@/lib/supabase/browser";
import { boardRequest } from "@/lib/board-client";
import { boardError, boardIdSchema, boardPostSchema, boardPasswordSchema } from "@/lib/board";

export function BoardEditor(){
  const id=useSearchParams().get("id");
  const router=useRouter();
  const [title,setTitle]=useState("");const [body,setBody]=useState("");
  const [ready,setReady]=useState(false);const [allowed,setAllowed]=useState(false);const [signedIn,setSignedIn]=useState(false);
  const [pending,setPending]=useState(false);const [error,setError]=useState("");
  const [password,setPassword]=useState("");const [confirm,setConfirm]=useState("");const [currentPassword,setCurrentPassword]=useState("");const [unlocked,setUnlocked]=useState(false);
  useEffect(()=>{
    let alive=true;
    async function load(){
      setReady(false);setAllowed(false);setError("");setTitle("");setBody("");setPassword("");setConfirm("");setCurrentPassword("");setUnlocked(!id);
      try{
        const client=memberClient();if(!client)throw new Error("게시판에 연결할 수 없습니다. 잠시 후 다시 방문해주세요.");
        const {data:{user}}=await client.auth.getUser();
        if(!alive)return;setSignedIn(Boolean(user));if(!user)return;
        if(id){
          if(!boardIdSchema.safeParse(id).success)throw new Error("게시글 주소가 올바르지 않습니다.");
          const {data,error:queryError}=await client.from("site_board_posts").select("title,author_id,is_protected").eq("id",id).maybeSingle();
          if(queryError)throw new Error(boardError(queryError.code));
          if(!data||data.author_id!==user.id)throw new Error("본인이 작성한 게시글만 수정할 수 있습니다.");
          if(!data.is_protected)throw new Error("게시글 상세 화면에서 열람 비밀번호를 먼저 설정해주세요.");
          if(alive)setTitle(data.title);
        }
        if(alive)setAllowed(true);
      }catch(caught){if(alive)setError(caught instanceof Error?caught.message:boardError());}
      finally{if(alive)setReady(true);}
    }
    void load();return()=>{alive=false;};
  },[id]);
  async function unlock(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(!id||pending)return;setPending(true);setError("");
    try{const result=await boardRequest({action:"read",id,password:currentPassword});if(!result.post)throw new Error(boardError());setTitle(result.post.title);setBody(result.post.body??"");setUnlocked(true);}
    catch(caught){setError(caught instanceof Error?caught.message:boardError());}
    finally{setPending(false);}
  }
  async function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(pending||!allowed||!unlocked)return;setError("");
    const parsed=boardPostSchema.safeParse({title,body});
    if(!parsed.success){setError(parsed.error.issues[0].message);return;}
    if(!id||password){const checked=boardPasswordSchema.safeParse(password);if(!checked.success){setError(checked.error.issues[0].message);return;}if(password!==confirm){setError("비밀번호 확인이 일치하지 않습니다.");return;}}
    setPending(true);
    try{
      const result=await boardRequest(id?{action:"update",id,...parsed.data,current_password:currentPassword,...(password?{password}:{})}:{action:"create",...parsed.data,password});
      if(!result.id)throw new Error(boardError());
      router.replace(`/board/post/?id=${result.id}`);
    }catch(caught){setError(caught instanceof Error?caught.message:boardError());}
    finally{setPending(false);}
  }
  return <><Link className="board-back" href={id?`/board/post/?id=${id}`:"/board/"}>← {id?"게시글 상세":"게시판 목록"}</Link><div className="board-editor-heading"><p className="eyebrow">Protected post</p><h1>{id?"게시글 수정":"게시글 작성"}</h1><p>제목·작성자는 공개됩니다. 본문은 열람 비밀번호를 아는 사람만 볼 수 있습니다. 회원 로그인 비밀번호와 다른 비밀번호를 사용해주세요.</p></div>{!ready?<p role="status">작성 권한을 확인하고 있습니다.</p>:!signedIn&&!error?<div className="board-state"><p>로그인한 회원만 글을 작성할 수 있습니다.</p><Link className="button button--primary" href="/login/">로그인</Link> <Link className="button button--outline" href="/signup/">회원가입</Link></div>:allowed&&!unlocked?<form className="board-unlock" onSubmit={unlock}><h2>수정 전 비밀번호 확인</h2><label htmlFor="edit-password">현재 열람 비밀번호</label><input id="edit-password" type="password" autoComplete="off" value={currentPassword} onChange={event=>setCurrentPassword(event.target.value)} required maxLength={128} disabled={pending}/><button className="button button--primary" disabled={pending}>{pending?"확인 중…":"수정 화면 열기"}</button></form>:allowed?<form className="board-editor" onSubmit={save}><fieldset disabled={pending}><legend className="sr-only">게시글 내용</legend><label htmlFor="post-title">제목</label><input id="post-title" value={title} onChange={event=>setTitle(event.target.value)} minLength={2} maxLength={120} required autoFocus/><label htmlFor="post-body">내용</label><textarea id="post-body" value={body} onChange={event=>setBody(event.target.value)} minLength={2} maxLength={10000} rows={14} required aria-describedby="post-length"/><p id="post-length" className="board-count">{body.length.toLocaleString("ko-KR")} / 10,000자 · 일반 텍스트로 저장됩니다.</p><label htmlFor="post-password">{id?"새 열람 비밀번호 (변경할 때만 입력)":"열람 비밀번호 (필수 · 8자 이상)"}</label><input id="post-password" type="password" autoComplete="new-password" value={password} onChange={event=>setPassword(event.target.value)} required={!id} minLength={8} maxLength={128}/><label htmlFor="post-password-confirm">열람 비밀번호 확인</label><input id="post-password-confirm" type="password" autoComplete="new-password" value={confirm} onChange={event=>setConfirm(event.target.value)} required={!id||Boolean(password)} minLength={8} maxLength={128}/><p className="board-count">비밀번호는 복구할 수 없습니다. 열람할 사람에게 별도로 전달해주세요.</p></fieldset><div className="board-actions"><button className="button button--primary" disabled={pending}>{pending?"저장 중…":id?"수정 완료":"등록하기"}</button><Link className="button button--outline" href={id?`/board/post/?id=${id}`:"/board/"}>취소</Link></div></form>:null}{error&&<p className="board-error" role="alert">{error}</p>}</>;
}
