import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { portfolioItems } from "@/lib/site-data";
export const metadata: Metadata = { title: "사업분야", description: "공유 디지털 팩토리, APQP 기반 DQMS와 산업 IoT 융합 사업" };
export default function PortfolioPage() { return <main id="main-content"><PageHero eyebrow="Business Areas" title="제조 디지털 혁신 사업분야" description="공유 디지털 팩토리, 디지털 품질경영과 산업 IoT 융합을 중심으로 사업을 추진합니다." /><section className="section"><div className="container content-grid">{portfolioItems.map((item) => <Link className="content-card" href={`/portfolio/${item.slug}`} key={item.slug}><div className={`visual visual--${item.tone}`}><span>{item.label}</span></div><div><h2>{item.title}</h2><p>{item.summary}</p><strong>사업 내용 →</strong></div></Link>)}</div></section></main>; }
