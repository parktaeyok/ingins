import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = { title: "회사소개", description: "제조 디지털 혁신을 지원하는 (주)인지아이앤에스 회사 및 사업자 정보" };

export default function AboutPage() {
  return (
    <main id="main-content">
      <PageHero eyebrow="About Us" title="제조 현장의 데이터에서 디지털 혁신을 시작합니다" description="(주)인지아이앤에스는 디지털 트윈, 품질경영 시스템과 산업 IoT를 제조 현장에 연결합니다." />
      <section className="section">
        <div className="container about-grid">
          <div><p className="eyebrow">Our Business</p><h2>제품 개발부터 생산과 품질까지 연결합니다.</h2></div>
          <div><p>제조기업은 제품과 공정이 복잡해질수록 개발, 생산, 품질과 협력사 데이터를 함께 관리해야 합니다. 인지아이앤에스는 현장 데이터를 가상 모델과 연결하는 디지털 트윈, APQP 기반 DQMS와 IoT·클라우드 플랫폼을 중심으로 제조 디지털 전환을 지원합니다.</p><p>시스템 구축뿐 아니라 현황 진단, 교육과 컨설팅, 데이터 분석과 인프라 운영까지 기업의 도입 단계에 필요한 범위를 함께 검토합니다.</p></div>
        </div>
      </section>
      <section className="section section--soft">
        <div className="container metric-grid">
          <article><strong>01</strong><h2>디지털 트윈</h2><p>현장 모니터링과 공정 시뮬레이션을 통해 제품과 생산 조건의 사전 검증을 지원합니다.</p></article>
          <article><strong>02</strong><h2>품질 데이터</h2><p>개발·양산·고객·협력사 품질 정보를 연결해 이슈와 개선 이력을 관리합니다.</p></article>
          <article><strong>03</strong><h2>산업 IoT</h2><p>센서, 클라우드와 분석 기술을 제조·생산 및 조선·해양 분야에 적용합니다.</p></article>
        </div>
      </section>
      <section className="section">
        <div className="container about-grid">
          <div><p className="eyebrow">Company Information</p><h2>사업자 정보</h2></div>
          <div className="company-facts">
            <p><b>법인명</b><span>(주)인지아이앤에스</span></p>
            <p><b>대표이사</b><span>박태억</span></p>
            <p><b>사업자등록번호</b><span>617-81-80010</span></p>
            <p><b>법인등록번호</b><span>180111-0688078</span></p>
            <p><b>개업일</b><span>2009년 10월 6일</span></p>
            <p><b>사업장 소재지</b><span>부산광역시 수영구 망미번영로52번길 26, 2층(수영동)</span></p>
            <p><b>사업 종목</b><span>S/W, 디지털콘텐츠, 영상, 웹디자인 · 하드웨어 제조 · 컴퓨터 관련 제품 도소매 · 전자상거래</span></p>
          </div>
        </div>
      </section>
      <section className="sub-cta"><div className="container"><h2>제조 현장의 과제를 알려주세요.</h2><Link className="button button--gold" href="/contact">사업 문의</Link></div></section>
    </main>
  );
}
