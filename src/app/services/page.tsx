import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { services } from "@/lib/site-data";
export const metadata: Metadata = { title: "서비스", description: "디지털 트윈, 스마트팩토리·품질경영, IoT·클라우드 플랫폼 서비스" };
export default function ServicesPage() { return <main id="main-content"><PageHero eyebrow="Services" title="제조 현장과 데이터를 연결하는 디지털 혁신 서비스" description="현장 진단부터 시스템 설계, 구축과 운영에 필요한 범위를 단계적으로 지원합니다." /><section className="section"><div className="container card-grid">{services.map((item, index) => <Link className="service-card service-card--large" href={`/services/${item.slug}`} key={item.slug}><span>0{index + 1}</span><h2>{item.title}</h2><p>{item.summary}</p><strong>서비스 상세 →</strong></Link>)}</div></section></main>; }
