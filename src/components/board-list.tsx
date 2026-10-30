"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { memberClient } from "@/lib/supabase/browser";
import { BOARD_PAGE_SIZE, boardDate, boardError, escapeBoardSearch, type BoardPost } from "@/lib/board";

export function BoardList() {
  const [posts,setPosts]=useState<BoardPost[]>([]);
  const [search,setSearch]=useState("");
  const [query,setQuery]=useState("");
  const [page,setPage]=useState(1);
  const [count,setCount]=useState(0);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(true);
  const [revision,setRevision]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    const client=memberClient();
    async function load(){
      setLoading(true);setError("");setPosts([]);
      if(!client){setError("게시판에 연결할 수 없습니다. 잠시 후 다시 방문해주세요.");setLoading(false);return;}
      try{
        let request=client.from("site_board_posts").select("id,title,author_username,created_at,updated_at,is_protected",{count:"exact"}).order("created_at",{ascending:false}).order("id",{ascending:false});
        if(query)request=request.ilike("title",`%${escapeBoardSearch(query)}%`);
        const result=await request.range((page-1)*BOARD_PAGE_SIZE,page*BOARD_PAGE_SIZE-1).abortSignal(controller.signal);
        if(controller.signal.aborted)return;
        if(result.error)throw new Error(boardError(result.error.code));
        setPosts(result.data as BoardPost[]);setCount(result.count??0);
      }catch(caught){if(!controller.signal.aborted)setError(caught instanceof Error?caught.message:boardError());}
      finally{if(!controller.signal.aborted)setLoading(false);}
    }
    void load();return()=>controller.abort();
  },[query,page,revision]);
  function find(event:FormEvent<HTMLFormElement>){event.preventDefault();setPage(1);setQuery(search.trim());setRevision(value=>value+1);}
  const pages=Math.max(1,Math.ceil(count/BOARD_PAGE_SIZE));
  return <><div className="board-toolbar"><div><h2>전체 게시글</h2><p>목록은 공개되며, 본문은 열람 비밀번호를 입력해야 볼 수 있습니다.</p></div><Link className="button button--primary" href="/board/write/">글쓰기 ＋</Link></div><form className="board-search" onSubmit={find}><label className="sr-only" htmlFor="board-search">제목 검색</label><input id="board-search" value={search} onChange={event=>setSearch(event.target.value)} maxLength={80} placeholder="제목으로 검색" type="search"/><button className="button button--outline" disabled={loading}>검색</button></form><div aria-live="polite" aria-busy={loading}>{loading?<p className="board-state" role="status">게시글을 불러오고 있습니다.</p>:error?<div className="board-state"><p role="alert">{error}</p><button className="button button--outline" onClick={()=>setRevision(value=>value+1)}>다시 시도</button></div>:<><p className="board-count">총 {count}개의 글</p>{posts.length?<div className="board-posts"><div className="board-columns" aria-hidden="true"><span>제목</span><span>작성자</span><span>등록일</span></div><ul>{posts.map(post=><li key={post.id}><Link className="board-post-link" href={`/board/post/?id=${post.id}`}><strong><span className="board-lock-label">🔒 비밀번호 글</span> {post.title}<span aria-hidden="true"> →</span></strong><span className="board-author">{post.author_username}</span><time dateTime={post.created_at}>{boardDate(post.created_at)}</time></Link></li>)}</ul></div>:<p className="board-state">{query?"검색 결과가 없습니다. 다른 검색어를 입력해주세요.":"아직 등록된 글이 없습니다. 첫 번째 이야기를 남겨주세요."}</p>}<nav className="board-pagination" aria-label="게시글 페이지"><button className="button button--outline" disabled={page<=1} onClick={()=>setPage(value=>value-1)}>← 이전</button><span>{page} / {pages}</span><button className="button button--outline" disabled={page>=pages} onClick={()=>setPage(value=>value+1)}>다음 →</button></nav></>}</div></>;
}
