import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { MemberAdmin } from "@/components/member-admin";
export const metadata: Metadata = { title: "회원 관리", robots: { index: false, follow: false } };
export default function MembersAdminPage() { return <main id="main-content"><PageHero eyebrow="Administration" title="회원 관리" description="관리자가 회원의 이용 상태를 확인하고 관리합니다." /><section className="section"><div className="container"><MemberAdmin /></div></section></main>; }
