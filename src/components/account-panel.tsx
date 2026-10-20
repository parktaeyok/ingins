"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useMember } from "@/components/member-session";
import { communityApi } from "@/lib/community-api";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export function AccountPanel() {
  const { user, profile, ready, reload, logout } = useMember();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return;
    const form = new FormData(event.currentTarget);
    setPending(true); setError(""); setMessage("");
    try { await communityApi("profile/", { method: "POST", body: JSON.stringify(Object.fromEntries(form)) }); await reload(); setMessage("회원 정보를 저장했습니다."); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "저장하지 못했습니다."); }
    finally { setPending(false); }
  }
  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setPending(true); setError(""); setMessage("");
    try {
      if (form.get("password") !== form.get("passwordConfirm")) throw new Error("비밀번호가 일치하지 않습니다.");
      const result = await getBrowserSupabase()?.auth.updateUser({ password: String(form.get("password")) });
      if (!result || result.error) throw new Error("비밀번호를 변경하지 못했습니다. 다시 로그인하거나 재설정 메일을 요청해주세요.");
      formElement.reset(); setMessage("비밀번호를 변경했습니다.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "변경하지 못했습니다."); }
    finally { setPending(false); }
  }
  if (!ready) return <p role="status">회원 정보를 확인하고 있습니다.</p>;
  if (!user) return <div className="member-card"><h2>로그인이 필요합니다</h2><p>회원가입 또는 로그인 후 내 정보를 관리할 수 있습니다.</p><Link className="button" href="/auth/">로그인·회원가입 →</Link></div>;
  return <div className="account-grid"><div className="member-card"><p className="badge">{profile?.role === "admin" ? "관리자" : "일반 회원"}</p><h2>내 정보</h2><p>{user.email}</p>{!profile && <p className="notice">이름과 회사명을 확인하고 저장하면 회원 등록이 완료됩니다.</p>}{profile && !profile.active && <p className="form-error">이용이 중지된 계정입니다. 관리자에게 문의해주세요.</p>}
    <form className="member-form" onSubmit={save} key={profile?.id ?? user.id}><label>이름 또는 별명 *<input name="display_name" defaultValue={profile?.display_name ?? String(user.user_metadata.display_name ?? "")} minLength={2} maxLength={40} required /></label><label>회사명<input name="company_name" defaultValue={profile?.company_name ?? String(user.user_metadata.company_name ?? "")} maxLength={100} /></label><button className="button button--primary" disabled={pending || profile?.active === false}>회원 정보 저장</button></form>
    <div className="button-row"><Link className="button" href="/board/">게시판 →</Link>{profile?.role === "admin" && <Link className="button" href="/admin/members/">회원 관리 →</Link>}<button className="button" disabled={pending} onClick={async () => { setPending(true); try { await logout(); } catch (caught) { setError(caught instanceof Error ? caught.message : "다시 시도해주세요."); } finally { setPending(false); } }}>로그아웃</button></div>
  </div><div className="member-card"><h2>비밀번호 변경</h2><p>메일의 재설정 링크로 접속한 경우에도 여기에서 새 비밀번호를 저장합니다.</p><form className="member-form" onSubmit={changePassword}><label>새 비밀번호 *<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label><label>새 비밀번호 확인 *<input name="passwordConfirm" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label><button className="button" disabled={pending}>비밀번호 변경</button></form></div>{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="notice" role="status">{message}</p>}</div>;
}
