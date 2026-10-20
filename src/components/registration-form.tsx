"use client";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { memberClient } from "@/lib/supabase/browser";
import { registrationSchema, usernameSchema } from "@/lib/registration";

export function RegistrationForm() {
  const [username, setUsername] = useState("");
  const usernameRef = useRef("");
  const [checked, setChecked] = useState("");
  const [checking, setChecking] = useState(false);
  const [pending, setPending] = useState(false);
  const [visible, setVisible] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const configured = Boolean(memberClient());

  async function checkUsername() {
    const parsed = usernameSchema.safeParse(username);
    setError(""); setNotice(""); setChecked("");
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    const client = memberClient(); if (!client) { setError("회원가입 연결 설정이 필요합니다."); return; }
    const candidate = parsed.data;
    setChecking(true);
    try {
      const { data, error: queryError } = await client.from("registration_handles").select("username").eq("username", candidate).limit(1);
      if (usernameRef.current.trim().toLowerCase() !== candidate) return;
      if (queryError) throw new Error("아이디를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.");
      if (data.length) { setError("이미 사용 중인 아이디입니다."); return; }
      setChecked(candidate); setNotice("사용할 수 있는 아이디입니다. 최종 등록 시 다시 확인됩니다.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "확인하지 못했습니다."); }
    finally { setChecking(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return;
    setError(""); setNotice("");
    const parsed = registrationSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    if (checked !== parsed.data.username) { setError("아이디 중복 확인을 먼저 해주세요."); return; }
    const client = memberClient(); if (!client) { setError("회원가입 연결 설정이 필요합니다."); return; }
    setPending(true);
    try {
      const value = parsed.data;
      const { data: handles, error: checkError } = await client.from("registration_handles").select("username").eq("username", value.username).limit(1);
      if (checkError) throw new Error("회원가입 연결 상태를 확인해주세요.");
      if (handles.length) { setChecked(""); throw new Error("이미 사용 중인 아이디입니다. 다른 아이디를 입력해주세요."); }
      const { data: authData, error: authError } = await client.auth.signUp({ email: value.email, password: value.password, options: {
        data: { registration_version: 1, username: value.username, full_name: value.full_name, display_name: value.full_name, phone: value.phone, postal_code: value.postal_code, address: value.address, address_detail: value.address_detail, company_name: value.company_name, privacy_agreed: true },
      } });
      if (authError) throw new Error("가입을 완료하지 못했습니다. 아이디 중복·이메일·비밀번호를 확인하거나 잠시 후 다시 시도해주세요.");
      if (!authData.session) throw new Error("이메일 확인 설정이 켜져 있거나 이미 사용 중인 이메일입니다. 운영자에게 문의해주세요.");
      setComplete(true);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "가입 요청을 처리하지 못했습니다."); }
    finally { setPending(false); }
  }
  if (complete) return <section className="register-card register-complete"><span aria-hidden="true">✓</span><h2>회원가입이 완료되었습니다</h2><p role="status">이메일 인증 없이 회원 서비스를 이용할 수 있습니다. 다음 로그인부터 가입한 아이디와 비밀번호를 사용해주세요.</p><Link className="button button--primary" href="/account/">내 회원 정보 보기 →</Link><Link href="/login/">아이디로 로그인 →</Link></section>;
  return <form className="register-card register-form" onSubmit={submit}>
    <h2>회원 정보 입력</h2><p className="register-hint">* 필수 항목입니다. 아이디와 비밀번호로 로그인하며, 이메일 인증은 필요하지 않습니다.</p>
    {!configured && <p role="status" className="register-message">회원가입 연결을 준비 중입니다.</p>}
    <fieldset disabled={pending}><legend>계정 정보</legend>
      <label htmlFor="join-id">아이디 *</label><div className="register-id-row"><input id="join-id" name="username" autoComplete="username" value={username} onChange={event => { setUsername(event.target.value); usernameRef.current=event.target.value; setChecked(""); setNotice(""); }} minLength={4} maxLength={24} required aria-describedby="join-id-help" /><button type="button" className="button" disabled={checking || !configured} onClick={checkUsername}>{checking ? "확인 중…" : "중복 확인"}</button></div><small id="join-id-help">영문 소문자로 시작, 4~24자 · 영문·숫자·밑줄(_)</small>
      {notice && <p className="register-message" role="status">{notice}</p>}
      <div className="register-grid"><label>이름 *<input name="full_name" autoComplete="name" minLength={2} maxLength={80} required /></label><label>이메일 *<input name="email" type="email" autoComplete="email" maxLength={190} required /></label><label>비밀번호 *<input name="password" type={visible ? "text" : "password"} autoComplete="new-password" minLength={12} maxLength={128} required /><small>12자 이상 입력해주세요.</small></label><label>비밀번호 확인 *<input name="password_confirm" type={visible ? "text" : "password"} autoComplete="new-password" minLength={12} maxLength={128} required /></label></div>
      <button type="button" className="register-toggle" aria-pressed={visible} onClick={() => setVisible(value => !value)}>{visible ? "비밀번호 숨기기" : "비밀번호 표시"}</button>
    </fieldset>
    <fieldset disabled={pending}><legend>연락처와 주소</legend><div className="register-grid"><label>전화번호 *<input name="phone" type="tel" autoComplete="tel" placeholder="010-1234-5678" maxLength={25} required /></label><label>회사명 (선택)<input name="company_name" autoComplete="organization" maxLength={100} /></label></div><label>우편번호 *<input name="postal_code" className="postal-input" inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{5}" maxLength={5} placeholder="우편번호 5자리" required /></label><label>기본 주소 *<input name="address" autoComplete="address-line1" minLength={5} maxLength={200} placeholder="도로명 또는 지번 주소" required /></label><label>상세 주소 (선택)<input name="address_detail" autoComplete="address-line2" maxLength={150} placeholder="동·호수 등 상세 주소" /></label></fieldset>
    <label className="register-consent"><input type="checkbox" name="privacy_agreed" value="yes" required disabled={pending} /><span>회원 가입을 위한 개인정보 수집 및 이용에 동의합니다. * <Link href="/privacy/" target="_blank" rel="noreferrer">처리방침 보기 ↗</Link></span></label>
    {error && <p className="register-error" role="alert">{error}</p>}
    <button className="button button--primary register-submit" disabled={pending || checking || !configured}>{pending ? "가입 처리 중…" : "회원가입"}</button><p className="register-login">이미 회원이신가요? <Link href="/login/">로그인 →</Link></p>
  </form>;
}
