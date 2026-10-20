import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { BoardPanel } from "@/components/board-panel";
export const metadata: Metadata = { title: "게시판", description: "제조 AX 공지와 질문, 현장 경험을 나누는 회원 게시판" };
export default function BoardPage() { return <main id="main-content"><PageHero eyebrow="Community boards" title="함께 나누는 제조 AX" description="공지사항을 확인하고 궁금한 점과 현장의 경험을 나눠보세요." /><section className="section"><div className="container"><BoardPanel /></div></section></main>; }
