import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { services } from "@/lib/site-data";
export const metadata: Metadata = { title: "서비스", description: "제조 업무 AI 도우미, PMS·QMS·SCM 데이터 연결과 제조 AI 분석 서비스" };
export default function ServicesPage() { return <main id="main-content"><PageHero eyebrow="Services" title="생산·품질·공급망을 연결하는 제조 AX 서비스" description="보고서와 문서 검색부터 시작하고, 데이터가 확보되면 예측과 추천으로 확장합니다." /><section className="section"><div className="container card-grid">{services.map((item, index) => <Link className="service-card service-card--large" href={`/services/${item.slug}`} key={item.slug}><span>0{index + 1}</span><h2>{item.title}</h2><p>{item.summary}</p><strong>서비스 상세 →</strong></Link>)}</div></section></main>; }
