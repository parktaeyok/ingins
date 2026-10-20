"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { memberClient } from "@/lib/supabase/browser";

export function MemberAccess({ account = false }: { account?: boolean }) {
  const [profile, setProfile] = useState<Record<string,string> | null>(null);
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(() => !account || !memberClient());
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (!account) return;
    const client = memberClient(); if (!client) return;
    let alive = true;
    async function load() {
      try {
        const { data: { user }, error: authError } = await client!.auth.getUser();
        if (!alive) return;
        if (authError || !user) { setReady(true); return; }
        setEmail(user.email ?? "");
        const { data, error: profileError } = await client!.from("registration_profiles").select("username,full_name,phone,postal_code,address,address_detail,company_name").eq("id",user.id).maybeSingle();
        if (alive) { if (profileError) setError("회원 정보를 불러오지 못했습니다."); else setProfile(data); setReady(true); }
      } catch { if (alive) { setError("연결 상태를 확인해주세요."); setReady(true); } }
    }
    // Wait for Auth to process the email verification session before reading it.
    const timer = setTimeout(() => { void load(); },0);
    return () => { alive=false; clearTimeout(timer); };
  },[account]);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return;
    setPending(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const client=memberClient(); if (!client) throw new Error("회원 연결 설정이 필요합니다.");
      const {error: authError}=await client.auth.signInWithPassword({email:String(form.get("email")).trim(),password:String(form.get("password"))});
      if(authError) throw new Error("이메일·비밀번호와 이메일 인증 여부를 확인해주세요.");
      router.push("/account/");
    } catch(caught){setError(caught instanceof Error?caught.message:"로그인하지 못했습니다.");}
    finally{setPending(false);}
  }
  if(account) return <section className="register-card register-account"><h1>내 회원 정보</h1>{!ready?<p role="status">회원 정보를 확인하고 있습니다.</p>:!email?<><p>로그인이 필요합니다.</p><Link className="button" href="/login/">로그인 →</Link></>:<><p>{email}</p>{profile?<dl>{[["username","아이디"],["full_name","이름"],["phone","전화번호"],["postal_code","우편번호"],["address","기본 주소"],["address_detail","상세 주소"],["company_name","회사명"]].map(([key,label])=><div className="register-account-entry" key={key}><dt>{label}</dt><dd>{profile[key]||"—"}</dd></div>)}</dl>:<p>등록된 상세 회원 정보가 없습니다.</p>}<button className="button" disabled={pending} onClick={async()=>{setPending(true);try{const result=await memberClient()?.auth.signOut();if(result?.error)throw new Error("로그아웃하지 못했습니다.");setEmail("");setProfile(null);}catch(caught){setError(caught instanceof Error?caught.message:"다시 시도해주세요.");}finally{setPending(false);}}}>로그아웃</button></>}{!memberClient()&&<p>회원 연결 설정이 필요합니다.</p>}{error&&<p className="register-error" role="alert">{error}</p>}</section>;
  return <form className="register-card register-session-form" onSubmit={login}><h1>회원 로그인</h1><p>가입한 이메일로 로그인해주세요.</p><label>이메일<input name="email" type="email" autoComplete="email" required /></label><label>비밀번호<input name="password" type="password" autoComplete="current-password" required /></label>{error&&<p className="register-error" role="alert">{error}</p>}<button className="button button--primary" disabled={pending||!memberClient()}>{pending?"로그인 중…":"로그인"}</button><Link href="/signup/">처음 오셨나요? 회원가입 →</Link></form>;
}
