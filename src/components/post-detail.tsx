"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { communityApi, type Post } from "@/lib/community-api";
import { useMember } from "@/components/member-session";

export function PostDetail({ id }: { id: string }) {
  const { user, profile } = useMember();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  useEffect(() => { let cancelled = false; communityApi<{ post: Post }>(`posts/${id}/`).then(data => { if (!cancelled) setPost(data.post); }).catch(caught => { if (!cancelled) setError(caught.message); }).finally(() => { if (!cancelled) setLoading(false); }); return () => { cancelled = true; }; }, [id]);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return;
    const body = Object.fromEntries(new FormData(event.currentTarget));
    setPending(true); setError("");
    try { await communityApi(`posts/${id}/`, { method: "PATCH", body: JSON.stringify(body) }); const result = await communityApi<{ post: Post }>(`posts/${id}/`); setPost(result.post); setEditing(false); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "수정하지 못했습니다."); }
    finally { setPending(false); }
  }
  async function remove() {
    if (pending) return; setPending(true); setError("");
    try { await communityApi(`posts/${id}/`, { method: "DELETE" }); router.push("/board/"); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "삭제하지 못했습니다."); setPending(false); }
  }
  if (loading) return <p role="status">게시글을 불러오고 있습니다.</p>;
  const canManage = Boolean(profile?.active && post && (user?.id === post.author_id || profile.role === "admin"));
  return <article className="member-card post-detail">{post && <>{editing ? <form className="member-form" onSubmit={save}><label>제목<input name="title" defaultValue={post.title} minLength={2} maxLength={150} required /></label><label>내용<textarea name="content" defaultValue={post.content} rows={14} minLength={5} maxLength={20000} required /></label><div className="button-row"><button className="button button--primary" disabled={pending}>수정 저장</button><button type="button" className="button" disabled={pending} onClick={() => setEditing(false)}>취소</button></div></form> : <><p className="badge">{post.author_name} · {new Date(post.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}</p><h2>{post.title}</h2><div className="post-content">{post.content}</div></>}{canManage && !editing && <div className="button-row"><button className="button" onClick={() => setEditing(true)} disabled={pending}>수정하기</button><button className="button" onClick={() => setDeleting(true)} disabled={pending}>삭제하기</button></div>}{deleting && <div className="delete-confirm" role="group" aria-label="게시글 삭제 확인"><p>이 게시글을 삭제할까요? 삭제한 내용은 복구할 수 없습니다.</p><button className="button" onClick={remove} disabled={pending}>삭제 확정</button> <button className="button" onClick={() => setDeleting(false)} disabled={pending}>취소</button></div>}</>}{error && <p className="form-error" role="alert">{error}</p>}<div className="button-row"><Link className="button" href="/board/">← 게시판 목록</Link></div></article>;
}
