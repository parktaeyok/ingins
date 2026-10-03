import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailSections } from "@/components/detail-sections";
import { blogPosts } from "@/lib/site-data";
export function generateStaticParams() { return blogPosts.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const post = blogPosts.find((entry) => entry.slug === slug); return post ? { title: post.title, description: post.summary } : {}; }
export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const post = blogPosts.find((entry) => entry.slug === slug); if (!post) notFound(); return <main id="main-content"><section className="detail-hero"><div className="container article"><span className="badge">{post.category}</span><h1>{post.title}</h1><p className="lead">{post.summary}</p></div></section><DetailSections sections={post.sections} /></main>; }
