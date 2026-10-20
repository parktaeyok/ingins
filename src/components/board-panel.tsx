"use client";
import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { communityApi, type Board, type Post } from "@/lib/community-api";
import { useMember } from "@/components/member-session";

export function BoardPanel() {
  const { user, profile } = useMember();
  const [boards, setBoards] = useState<Board[]>([]);
  const [board, setBoard] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const loadBoards = useCallback(async () => {
    const result = await communityApi<{ boards: Board[] }>("boards/");
    setBoards(result.boards);
  }, []);
  useEffect(() => { let cancelled = false; communityApi<{ boards: Board[] }>("boards/").then(data => { if (!cancelled) setBoards(data.boards); }).catch(caught => { if (!cancelled) setError(caught.message); }); return () => { cancelled = true; }; }, []);
  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page: String(page), q: query });
    if (board) params.set("board", board);
    communityApi<{ posts: Post[]; total: number }>(`posts/?${params}`).then(data => { if (!cancelled) { setPosts(data.posts); setTotal(data.total); setError(""); } }).catch(caught => { if (!cancelled) { setPosts([]); setError(caught.message); } }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, query, board]);
  function filter(nextBoard: string) { if (nextBoard !== board || page !== 1) setLoading(true); setBoard(nextBoard); setPage(1); }
  async function createBoard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return;
    const form = event.currentTarget;
    setPending(true); setError(""); setNotice("");
    try { await communityApi("boards/", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) }); await loadBoards(); form.reset(); setNotice("게시판을 만들었습니다."); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "게시판을 만들지 못했습니다."); }
    finally { setPending(false); }
  }
  return <>
    <div className="board-intro"><div><p className="eyebrow">Community</p><h2>제조 AX 소통 공간</h2><p>누구나 읽을 수 있고, 회원은 질문과 경험을 등록할 수 있습니다.</p></div><Link className="button button--primary" href={user ? `/board/new/${board ? `?board=${board}` : ""}` : "/auth/"}>{user ? "＋ 글쓰기" : "로그인하고 글쓰기 →"}</Link></div>
    {user && !profile && <p className="notice"><Link href="/account/">내 정보에서 회원 등록을 완료해주세요 →</Link></p>}
    <div className="board-filters" aria-label="게시판 선택"><button aria-pressed={!board} onClick={() => filter("")}>전체 게시글</button>{boards.map(item => <button key={item.id} aria-pressed={board === item.id} onClick={() => filter(item.id)}>{item.name}{item.write_role === "admin" ? " · 공지" : ""}</button>)}</div>
    {board && <p className="board-description">{boards.find(item => item.id === board)?.description}</p>}
    <form className="board-search" onSubmit={event => { event.preventDefault(); if (search !== query || page !== 1) setLoading(true); setQuery(search); setPage(1); }}><label htmlFor="board-query" className="sr-only">게시글 제목 검색</label><input id="board-query" type="search" value={search} onChange={event => setSearch(event.target.value)} maxLength={100} placeholder="게시글 제목을 검색하세요" /><button className="button">검색</button><button type="button" className="button" onClick={() => { setSearch(""); setQuery(""); setPage(1); }}>초기화</button></form>
    {error && <p className="form-error" role="alert">{error}</p>}{notice && <p className="notice" role="status">{notice}</p>}
    <div className="post-list" aria-busy={loading}>{loading ? <p role="status">게시글을 불러오고 있습니다.</p> : posts.length === 0 ? <div className="board-empty"><h3>{error ? "게시판 연결을 확인해주세요" : "등록된 게시글이 없습니다"}</h3><p>{query ? "다른 검색어로 찾아보세요." : "첫 질문이나 경험을 나눠보세요."}</p></div> : posts.map(post => <Link className="post-row" key={post.id} href={`/board/${post.id}/`}><div><span className="badge">{boards.find(item => item.id === post.board_id)?.name ?? "게시글"}</span><h3>{post.title}</h3><p>{post.author_name} · {new Date(post.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}</p></div><span className="click-arrow" aria-hidden="true">↗</span><span className="sr-only">게시글 읽기</span></Link>)}</div>
    <div className="pagination"><button className="button" disabled={page <= 1 || loading} onClick={() => { setPage(value => value - 1); setLoading(true); }}>← 이전</button><span>{page} / {Math.max(1, Math.ceil(total / 10))} 페이지 · {total}건</span><button className="button" disabled={page * 10 >= total || loading} onClick={() => { setPage(value => value + 1); setLoading(true); }}>다음 →</button></div>
    {profile?.role === "admin" && profile.active && <details className="member-card board-admin"><summary>＋ 새 게시판 만들기</summary><form className="member-form" onSubmit={createBoard}><label>게시판 이름 *<input name="name" minLength={2} maxLength={40} required /></label><label>영문 주소 *<input name="slug" minLength={2} maxLength={40} pattern="[a-z][a-z0-9-]{1,39}" placeholder="예: field-questions" required /><small>영문 소문자로 시작하며 소문자·숫자·하이픈을 사용합니다.</small></label><label>설명<input name="description" maxLength={200} /></label><label>글쓰기 권한<select name="write_role"><option value="member">로그인 회원</option><option value="admin">관리자만 (공지사항)</option></select></label><button className="button button--primary" disabled={pending}>{pending ? "만드는 중…" : "게시판 만들기"}</button></form></details>}
  </>;
}
