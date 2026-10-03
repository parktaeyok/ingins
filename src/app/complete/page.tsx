import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "접수 완료", robots: { index: false, follow: false } };
const labels: Record<string, string> = { inquiry: "사업 문의", diagnosis: "제조 DX 진단", education: "교육·컨설팅 상담" };
export default async function CompletePage({ searchParams }: { searchParams: Promise<{ type?: string; receipt?: string }> }) { const query = await searchParams; const type = labels[query.type ?? ""] ?? "신청"; return <main id="main-content" className="state-page"><section><p className="eyebrow">Request Complete</p><h1>{type}이 접수되었습니다.</h1>{query.receipt && <p className="receipt">접수번호 <strong>{query.receipt}</strong></p>}<p>내용을 확인한 뒤 입력하신 연락처로 안내드리겠습니다.</p><div className="button-row"><Link className="button button--primary" href="/">홈으로</Link><Link className="button button--outline" href="/blog">기술정보 보기</Link></div></section></main>; }
