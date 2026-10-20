"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { communityApi, type Board } from "@/lib/community-api";
import { useMember } from "@/components/member-session";

export function PostComposer({ initialBoard }: { initialBoard: string }) {
  const { user, profile, ready } = useMember();
  const [boards, setBoards] = useState<Board[]>([]);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  useEffect(() => { let cancelled = false; communityApi<{ boards: Board[] }>("boards/").then(data => { if (!cancelled) setBoards(data.boards); }).catch(caught => { if (!cancelled) setError(caught.message); }).finally(() => { if (!cancelled) setLoaded(true); }); return () => { cancelled = true; }; }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return;
    setPending(true); setError("");
    try { const result = await communityApi<{ post: { id: string } }>("posts/", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); router.push(`/board/${result.post.id}/`); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "등록하지 못했습니다."); setPending(false); }
  }
  if (!ready) return <p role="status">로그인 상태를 확인하고 있습니다.</p>;
  if (!user) return <div className="member-card"><h2>로그인 후 글을 작성할 수 있습니다</h2><Link className="button" href="/auth/">로그인·회원가입 →</Link></div>;
  if (!profile || !profile.active) return <div className="member-card"><h2>{profile ? "이용이 중지된 회원입니다" : "회원 등록을 완료해주세요"}</h2><Link className="button" href="/account/">내 정보 확인 →</Link></div>;
  const writable = boards.filter(board => board.write_role === "member" || profile.role === "admin");
  return <div className="member-card"><h2>새 게시글</h2><p>게시글은 공개됩니다. 개인정보와 회사의 기밀 자료는 넣지 마세요.</p><form className="member-form" onSubmit={submit}><label>게시판 *<select name="board_id" defaultValue={initialBoard} key={boards.length} required><option value="">게시판을 선택해주세요</option>{writable.map(board => <option key={board.id} value={board.id}>{board.name}</option>)}</select></label>{loaded && writable.length === 0 && <p className="notice">작성할 수 있는 게시판이 없습니다. 관리자에게 문의해주세요.</p>}<label>제목 *<input name="title" minLength={2} maxLength={150} required /></label><label>내용 *<textarea name="content" rows={14} minLength={5} maxLength={20000} required /></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="button-row"><button className="button button--primary" disabled={pending || !loaded || writable.length === 0}>{pending ? "등록 중…" : "게시글 등록"}</button><Link className="button" href="/board/">목록으로</Link></div></form></div>;
}
