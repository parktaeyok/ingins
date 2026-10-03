"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Kind = "inquiry" | "diagnosis" | "education";
const labels = { inquiry: "사업 문의 접수", diagnosis: "진단 신청", education: "교육·컨설팅 신청" };

export function SubmissionForm({ kind }: { kind: Kind }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return; setPending(true); setError("");
    const form = event.currentTarget; const payload = Object.fromEntries(new FormData(form));
    try { const response = await fetch(`/api/submissions/${kind}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }); const result = await response.json(); if (!response.ok) throw new Error(result.message ?? "신청을 저장하지 못했습니다."); router.push(`/complete?type=${kind}&receipt=${encodeURIComponent(result.receipt)}`); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "잠시 후 다시 시도해주세요."); setPending(false); }
  }
  return <form className="application-form" onSubmit={submit}>
    <div className="honeypot" aria-hidden="true"><label>웹사이트<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    {kind === "inquiry" && <fieldset><legend>문의 유형</legend><div className="radio-row"><label><input type="radio" name="inquiryType" value="estimate" defaultChecked /> 사업·구축 상담</label><label><input type="radio" name="inquiryType" value="general" /> 일반 문의</label><label><input type="radio" name="inquiryType" value="maintenance" /> 운영·유지보수</label></div></fieldset>}
    {kind === "diagnosis" && <fieldset><legend>진단 유형</legend><div className="radio-row"><label><input type="radio" name="diagnosisType" value="simple" defaultChecked /> 사전진단</label><label><input type="radio" name="diagnosisType" value="detailed" /> 상세진단 상담</label></div></fieldset>}
    <div className="form-grid">
      <label><span>{kind === "education" ? "신청자명" : "담당자명"} *</span><input name="name" maxLength={100} autoComplete="name" required /></label>
      <label><span>회사명</span><input name="companyName" maxLength={200} autoComplete="organization" /></label>
      <label><span>이메일 *</span><input name="email" type="email" maxLength={190} autoComplete="email" required /></label>
      <label><span>연락처 {kind === "education" ? "*" : ""}</span><input name="phone" type="tel" maxLength={30} autoComplete="tel" required={kind === "education"} /></label>
    </div>
    {kind === "inquiry" && <label><span>문의 제목 *</span><input name="subject" maxLength={200} required /></label>}
    {kind === "diagnosis" && <label><span>회사 또는 공장 소개 URL *</span><input name="websiteUrl" type="url" maxLength={500} placeholder="https://example.com" required /></label>}
    {kind === "education" && <label><span>디지털 전환 단계</span><select name="experienceLevel" defaultValue=""><option value="">선택해주세요</option><option value="none">도입 검토 단계</option><option value="basic">일부 시스템 운영 중</option><option value="experienced">DX·스마트공장 운영 중</option></select></label>}
    <label><span>{kind === "inquiry" ? "문의 내용" : "요청 내용"}{kind === "inquiry" ? " *" : ""}</span><textarea name="message" rows={7} maxLength={5000} required={kind === "inquiry"} /></label>
    <label className="privacy-check"><input type="checkbox" name="privacyAgreed" value="true" required /><span>개인정보 수집 및 이용에 동의합니다. <Link href="/privacy">내용 보기</Link></span></label>
    <div className="form-status" aria-live="polite">{error && <p>{error}</p>}</div>
    <button className="button button--primary" type="submit" disabled={pending}>{pending ? "접수 중입니다…" : labels[kind]}</button>
  </form>;
}
