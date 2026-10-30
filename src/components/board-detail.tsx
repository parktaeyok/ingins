"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { memberClient } from "@/lib/supabase/browser";
import { boardRequest } from "@/lib/board-client";
import { BOARD_PUBLIC_FIELDS, boardDate, boardError, boardIdSchema, boardPasswordSchema, type BoardPost } from "@/lib/board";

export function BoardDetail(){
  const id=useSearchParams().get("id");
  const router=useRouter();
  const [post,setPost]=useState<BoardPost|null>(null);
  const [owner,setOwner]=useState(false);
  const [loading,setLoading]=useState(true);
  const [pending,setPending]=useState(false);
  const [error,setError]=useState("");
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [credential,setCredential]=useState("");
  const [unlocked,setUnlocked]=useState(false);
  const [notice,setNotice]=useState("");
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{
    let alive=true;
    async function load(){
      setLoading(true);setError("");setPost(null);setOwner(false);setUnlocked(false);setPassword("");setConfirm("");setCredential("");setNotice("");
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
  async function unlock(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(pending||!post)return;setPending(true);setError("");setNotice("");
    try{
      if(!post.is_protected){
        const parsed=boardPasswordSchema.safeParse(password);
        if(!parsed.success)throw new Error(parsed.error.issues[0].message);
        if(password!==confirm)throw new Error("비밀번호 확인이 일치하지 않습니다.");
        await boardRequest({action:"set-password",id:post.id,password});
        setPost({...post,is_protected:true});setPassword("");setConfirm("");setNotice("열람 비밀번호를 설정했습니다. 비밀번호를 입력해 본문을 열어주세요.");return;
      }
      const result=await boardRequest({action:"read",id:post.id,password});
      if(!result.post)throw new Error(boardError());
      setPost({...post,...result.post});setCredential(password);setPassword("");setUnlocked(true);
    }catch(caught){setError(caught instanceof Error?caught.message:boardError());}
    finally{setPending(false);}
  }
  async function remove(){
    if(pending||!post||!unlocked)return;setPending(true);setError("");
    try{await boardRequest({action:"delete",id:post.id,password:credential});router.replace("/board/");}
    catch(caught){setError(caught instanceof Error?caught.message:boardError());dialog.current?.close();}
    finally{setPending(false);}
  }
  function lock(){setPost(value=>value?{...value,body:undefined}:null);setUnlocked(false);setCredential("");setPassword("");setError("");}
  return <><Link className="board-back" href="/board/">← 게시판 목록</Link>{loading?<p className="board-state" role="status">게시글을 불러오고 있습니다.</p>:post?<article className="board-detail"><p className="eyebrow">Protected post</p><h1>{post.title}</h1><p className="board-meta"><span>작성자 {post.author_username}</span><time dateTime={post.created_at}>{boardDate(post.created_at)}</time><span>비밀번호 보호</span></p>{unlocked?<><div className="board-body">{post.body}</div><div className="board-actions"><button className="button button--outline" onClick={lock}>다시 잠그기</button>{owner&&<><Link className="button button--outline" href={`/board/write/?id=${post.id}`}>수정</Link><button className="button board-delete" onClick={()=>dialog.current?.showModal()}>삭제</button></>}</div></>:post.is_protected||owner?<form className="board-unlock" onSubmit={unlock}><h2>{post.is_protected?"열람 비밀번호를 입력해주세요":"기존 글에 열람 비밀번호 설정"}</h2><p>{post.is_protected?"비밀번호가 일치하면 본문을 볼 수 있습니다. 새로고침하면 다시 잠깁니다.":"이 글은 아직 비밀번호가 없어 본문을 숨겼습니다. 작성자만 처음 비밀번호를 설정할 수 있습니다."}</p><label htmlFor="read-password">{post.is_protected?"열람 비밀번호":"새 열람 비밀번호 (8자 이상)"}</label><input id="read-password" type="password" autoComplete={post.is_protected?"off":"new-password"} value={password} onChange={event=>setPassword(event.target.value)} minLength={post.is_protected?1:8} maxLength={128} required disabled={pending}/>{!post.is_protected&&<><label htmlFor="read-confirm">비밀번호 확인</label><input id="read-confirm" type="password" autoComplete="new-password" value={confirm} onChange={event=>setConfirm(event.target.value)} minLength={8} maxLength={128} required disabled={pending}/></>}<button className="button button--primary" disabled={pending}>{pending?"확인 중…":post.is_protected?"본문 열기":"비밀번호 설정"}</button></form>:<p className="board-state">작성자가 열람 비밀번호를 설정하기 전까지 본문은 비공개입니다.</p>}</article>:null}{notice&&<p className="board-state" role="status">{notice}</p>}{error&&<p className="board-error" role="alert">{error}</p>}<dialog className="board-dialog" ref={dialog} aria-labelledby="delete-title" onCancel={event=>{if(pending)event.preventDefault();}}><h2 id="delete-title">게시글을 삭제할까요?</h2><p>삭제한 글은 복구할 수 없습니다.</p><div className="board-actions"><button className="button button--outline" autoFocus disabled={pending} onClick={()=>dialog.current?.close()}>취소</button><button className="button board-delete" disabled={pending} onClick={()=>void remove()}>{pending?"삭제 중…":"삭제하기"}</button></div></dialog></>;
}
