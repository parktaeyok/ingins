import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { PostComposer } from "@/components/post-composer";
export const metadata: Metadata = { title: "게시글 작성", robots: { index: false, follow: false } };
export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ board?: string }> }) { const { board } = await searchParams; return <main id="main-content"><PageHero eyebrow="Write a post" title="질문과 경험을 남겨주세요" description="제목과 내용을 작성하고 게시판을 선택하면 공개 등록됩니다." /><section className="section"><div className="container member-editor"><PostComposer initialBoard={board ?? ""} /></div></section></main>; }
