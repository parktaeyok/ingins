import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { BoardList } from "@/components/board-list";
import "./board.css";
export const metadata: Metadata = { title: "게시판" };
export default function BoardPage() {
  return <main id="main-content"><PageHero eyebrow="Community" title="게시판" description="제조 AX와 서비스에 관한 소식과 의견을 나눕니다." /><section className="section board-section"><div className="container"><BoardList /></div></section></main>;
}
