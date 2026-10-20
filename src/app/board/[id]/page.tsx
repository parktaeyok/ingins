import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { PostDetail } from "@/components/post-detail";
export const metadata: Metadata = { title: "게시글 보기", robots: { index: false, follow: true } };
export default async function PostPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <main id="main-content"><PageHero eyebrow="Community post" title="게시글 보기" description="현장의 질문과 경험을 함께 확인합니다." /><section className="section"><div className="container member-editor"><PostDetail id={id} /></div></section></main>; }
