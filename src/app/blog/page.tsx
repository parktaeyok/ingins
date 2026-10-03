import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { blogPosts } from "@/lib/site-data";
export const metadata: Metadata = { title: "기술정보", description: "디지털 트윈, 스마트팩토리, 품질 데이터와 산업 IoT 기술정보" };
export default function BlogPage() { return <main id="main-content"><PageHero eyebrow="Insights" title="제조 디지털 혁신 기술정보" description="디지털 트윈과 품질 데이터, 스마트팩토리와 산업 IoT의 적용 범위를 설명합니다." /><section className="section"><div className="container blog-grid">{blogPosts.map((post) => <Link href={`/blog/${post.slug}`} key={post.slug}><span>{post.category}</span><h2>{post.title}</h2><p>{post.summary}</p><strong>글 읽기 →</strong></Link>)}</div></section></main>; }
