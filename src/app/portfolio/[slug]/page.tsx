import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailSections } from "@/components/detail-sections";
import { portfolioItems } from "@/lib/site-data";
export function generateStaticParams() { return portfolioItems.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const item = portfolioItems.find((entry) => entry.slug === slug); return item ? { title: item.title, description: item.summary } : {}; }
export default async function PortfolioDetailPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const item = portfolioItems.find((entry) => entry.slug === slug); if (!item) notFound(); return <main id="main-content"><section className="detail-hero"><div className="container"><span className="badge">{item.label}</span><h1>{item.title}</h1><p className="lead">{item.summary}</p></div></section><DetailSections sections={item.sections} /></main>; }
