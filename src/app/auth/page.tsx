import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { AuthPanel } from "@/components/auth-panel";
export const metadata: Metadata = { title: "로그인·회원가입", robots: { index: false, follow: false } };
export default function AuthPage() { return <main id="main-content"><PageHero eyebrow="Members" title="회원 서비스" description="회원으로 등록하고 제조 AX 게시판에서 질문과 경험을 나눠보세요." /><section className="section"><div className="container member-narrow"><AuthPanel /></div></section></main>; }
