"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { communityApi, type MemberProfile } from "@/lib/community-api";
import { useMember } from "@/components/member-session";

export function MemberAdmin() {
  const { user, profile, ready } = useMember();
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [target, setTarget] = useState<MemberProfile | null>(null);
  useEffect(() => {
    if (profile?.role !== "admin" || !profile.active) return;
    let cancelled = false;
    communityApi<{ members: MemberProfile[]; total: number }>(`members/?page=${page}`).then(data => { if (!cancelled) { setMembers(data.members); setTotal(data.total); setError(""); } }).catch(caught => { if (!cancelled) setError(caught.message); });
    return () => { cancelled = true; };
  }, [profile?.role, profile?.active, page, version]);
  async function changeState() {
    if (!target || pending) return;
    setPending(true); setError("");
    try { await communityApi("members/", { method: "PATCH", body: JSON.stringify({ id: target.id, active: !target.active }) }); setTarget(null); setVersion(value => value + 1); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "상태를 변경하지 못했습니다."); }
    finally { setPending(false); }
  }
  if (!ready) return <p role="status">관리자 권한을 확인하고 있습니다.</p>;
  if (!user) return <div className="member-card"><h2>관리자 로그인이 필요합니다</h2><Link className="button" href="/auth/">로그인 →</Link></div>;
  if (profile?.role !== "admin" || !profile.active) return <div className="member-card"><h2>관리자만 이용할 수 있습니다</h2><Link className="button" href="/account/">내 정보 →</Link></div>;
  return <div className="member-card"><div className="board-intro"><div><h2>회원 관리</h2><p>이메일 인증 후 회원 정보를 등록한 계정을 관리합니다.</p></div><Link className="button" href="/board/">게시판 관리 →</Link></div>{error && <p className="form-error" role="alert">{error}</p>}{target && <div className="delete-confirm"><p>{target.display_name} 회원을 {target.active ? "이용 중지" : "이용 재개"}할까요?</p><button className="button" onClick={changeState} disabled={pending}>상태 변경 확정</button> <button className="button" onClick={() => setTarget(null)} disabled={pending}>취소</button></div>}<div className="member-table-wrap"><table className="member-table"><caption>회원 목록 · {total}명</caption><thead><tr><th scope="col">이름·별명</th><th scope="col">회사</th><th scope="col">권한</th><th scope="col">상태</th><th scope="col">관리</th></tr></thead><tbody>{members.map(member => <tr key={member.id}><td>{member.display_name}</td><td>{member.company_name || "—"}</td><td>{member.role === "admin" ? "관리자" : "회원"}</td><td>{member.active ? "이용 중" : "중지"}</td><td>{member.role === "member" && <button className="button" disabled={pending} onClick={() => setTarget(member)}>{member.active ? "이용 중지" : "이용 재개"}</button>}</td></tr>)}</tbody></table></div><div className="pagination"><button className="button" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>이전</button><span>{page} / {Math.max(1, Math.ceil(total / 20))}</span><button className="button" disabled={page * 20 >= total} onClick={() => setPage(value => value + 1)}>다음</button></div></div>;
}
