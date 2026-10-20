import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { AccountPanel } from "@/components/account-panel";
export const metadata: Metadata = { title: "내 정보", robots: { index: false, follow: false } };
export default function AccountPage() { return <main id="main-content"><PageHero eyebrow="My account" title="내 회원 정보" description="회원 정보와 비밀번호를 관리합니다." /><section className="section"><div className="container"><AccountPanel /></div></section></main>; }
