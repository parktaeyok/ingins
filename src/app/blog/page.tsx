import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { blogPosts } from "@/lib/site-data";
export const metadata: Metadata = { title: "AX 인사이트", description: "중소 제조기업의 AI 도입, 생산 보고서, 품질문서 검색과 데이터 검증 가이드" };
export default function BlogPage() { return <main id="main-content"><PageHero eyebrow="AX field notes" title="제조 AX를 준비하는 실무 가이드" description="업무 선정부터 데이터 확인, 근거 검토와 시범 검증까지 현장 도입의 기준을 정리했습니다." /><section className="section"><div className="container blog-grid">{blogPosts.map((post) => <Link href={`/blog/${post.slug}`} key={post.slug}><span>{post.category}</span><h2>{post.title}</h2><p>{post.summary}</p><strong>글 읽기 →</strong></Link>)}</div></section></main>; }
