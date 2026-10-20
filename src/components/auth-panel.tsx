"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { useMember } from "@/components/member-session";

type AuthMode = "login" | "signup" | "reset";
export function AuthPanel({ initialMode = "login", signupOnly = false }: { initialMode?: AuthMode; signupOnly?: boolean }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [completed, setCompleted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { configured, user, reload } = useMember();
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return;
    const client = getBrowserSupabase();
    if (!client) { setError("회원 서비스 연결을 준비 중입니다."); return; }
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password") ?? "");
    setPending(true); setError(""); setMessage("");
    try {
      if (mode === "signup") {
        if (password !== form.get("passwordConfirm")) throw new Error("비밀번호가 일치하지 않습니다.");
        const { data, error: authError } = await client.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/account/`, data: { display_name: String(form.get("displayName")).trim(), company_name: String(form.get("companyName") ?? "").trim() } } });
        if (authError) throw new Error("가입 요청을 처리하지 못했습니다. 입력 내용을 확인하거나 잠시 후 다시 시도해주세요.");
        if (data.session) { await reload(); router.push("/account/"); }
        else { setMessage("가입 요청을 접수했습니다. 받은 편지함의 인증 메일을 확인한 뒤 로그인해주세요. 이미 가입했다면 로그인을 이용해주세요."); setCompleted(true); }
      } else if (mode === "reset") {
        const { error: authError } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/account/` });
        if (authError) throw new Error("재설정 메일을 요청하지 못했습니다. 잠시 후 다시 시도해주세요.");
        setMessage("등록된 이메일이라면 비밀번호 재설정 메일이 발송됩니다. 메일의 링크를 연 뒤 내 정보에서 비밀번호를 변경해주세요.");
      } else {
        const { error: authError } = await client.auth.signInWithPassword({ email, password });
        if (authError) throw new Error("이메일·비밀번호 또는 이메일 인증 여부를 확인해주세요.");
        await reload(); router.push("/account/");
      }
    } catch (caught) { setError(caught instanceof Error ? caught.message : "잠시 후 다시 시도해주세요."); }
    finally { setPending(false); }
  }
  if (signupOnly && completed) return <div className="member-card signup-complete"><span className="signup-complete-icon" aria-hidden="true">✓</span><p className="eyebrow">Check your email</p><h2>이메일을 확인해주세요</h2><p role="status">{message}</p><p>메일이 보이지 않으면 스팸함도 확인해주세요.</p><Link className="button button--primary" href="/auth/">인증 후 로그인 →</Link><button className="signup-text-button" type="button" onClick={() => { setCompleted(false); setMessage(""); }}>가입 정보를 다시 입력할게요</button></div>;
  return <div className={`member-card${signupOnly ? " signup-form-card" : ""}`}>
    {!signupOnly && <div className="member-tabs" aria-label="회원 서비스 선택">{([["login", "로그인"], ["signup", "회원가입"], ["reset", "비밀번호 찾기"]] as const).map(([value, label]) => <button type="button" key={value} aria-pressed={mode === value} disabled={pending} onClick={() => { setMode(value); setError(""); setMessage(""); setCompleted(false); }}>{label}</button>)}</div>}
    <h2>{signupOnly ? "기본 정보를 입력해주세요" : mode === "signup" ? "새 회원 등록" : mode === "reset" ? "비밀번호 재설정" : "회원 로그인"}</h2>
    {signupOnly && <p className="signup-required">* 표시는 필수 항목입니다. 회사명은 선택 입력이에요.</p>}
    {!configured && <p className="notice">회원 서비스 연결을 준비 중입니다. 설정 후 가입과 로그인을 이용할 수 있습니다.</p>}
    {user && <p className="notice">현재 로그인되어 있습니다. <Link href="/account/">내 정보로 이동 →</Link></p>}
    <form onSubmit={submit} className="member-form">
      {mode === "signup" && <><label>이름 또는 별명 *<input name="displayName" minLength={2} maxLength={40} required autoComplete="nickname" /></label><label>회사명<input name="companyName" maxLength={100} autoComplete="organization" /></label></>}
      <label>이메일 *<input name="email" type="email" autoComplete="email" maxLength={190} required /></label>
      {mode !== "reset" && <label>비밀번호 *<input name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={mode === "signup" ? 12 : 1} maxLength={128} required />{mode === "signup" && <small>12자 이상 입력해주세요.</small>}</label>}
      {mode === "signup" && <><label>비밀번호 확인 *<input name="passwordConfirm" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={12} maxLength={128} required /></label>{signupOnly && <button className="signup-text-button" type="button" aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}</button>}<label className="privacy-check"><input type="checkbox" required /><span>회원 정보 수집 및 이용에 동의합니다. <Link href="/privacy/">개인정보처리방침</Link></span></label></>}
      {error && <p className="form-error" role="alert">{error}</p>}{message && <p className="notice" role="status">{message}</p>}
      <button className="button button--primary" disabled={pending || !configured}>{pending ? "처리 중…" : mode === "signup" ? "회원가입" : mode === "reset" ? "재설정 메일 받기" : "로그인"}</button>
    </form>
    {signupOnly && <p className="signup-login">이미 회원이신가요? <Link href="/auth/">로그인 →</Link></p>}
  </div>;
}
