import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = { title: "회사소개", description: "제조 디지털 혁신을 지원하는 (주)인지아이앤에스 회사 및 사업자 정보" };

export default function AboutPage() {
  return (
    <main id="main-content">
      <PageHero eyebrow="About Us" title="현장의 반복 업무에서 제조 AX를 시작합니다" description="(주)인지아이앤에스는 생산·품질·공급망 데이터를 연결하고 AI를 현장 업무에 적용하는 서비스를 추진합니다." />
      <section className="section">
        <div className="container about-grid">
          <div><p className="eyebrow">Our Business</p><h2>기존 자료를 연결해 현장의 업무를 개선합니다.</h2></div>
          <div><p>생산 보고서 작성과 품질문서 검색을 첫 적용 업무로 제안합니다. 기존 ERP·MES·QMS가 있으면 연동을 검토하고, 시스템이 없으면 작업지시·실적·검사·LOT 관리 등 필요한 최소 기능부터 범위를 정합니다.</p><p>부산·울산·경남의 금속가공·기계부품 제조기업을 우선 검토하며 생산·품질 담당자와 함께 도입 과제를 확인합니다. 현장 진단, 시범 검증, 구축과 실무 교육을 단계적으로 진행하는 방향입니다.</p></div>
        </div>
      </section>
      <section className="section section--soft">
        <div className="container metric-grid">
          <article><strong>01</strong><h2>작은 범위부터</h2><p>공장 1곳·업무 1개에서 자료와 도입 전후 작업시간을 확인합니다.</p></article>
          <article><strong>02</strong><h2>근거 있는 결과</h2><p>숫자는 계산으로 확정하고 문서 근거와 버전을 표시합니다. 최종 판단은 담당자가 합니다.</p></article>
          <article><strong>03</strong><h2>검증 후 확장</h2><p>실제 사용과 효과가 확인된 뒤 납기·불량·재고 분석을 검토합니다.</p></article>
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
