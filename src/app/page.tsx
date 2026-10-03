import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { services, portfolioItems, blogPosts } from "@/lib/site-data";

export default function HomePage() {
  return (
    <main id="main-content">
      <section className="hero hero--home">
        <div className="container hero__grid">
          <div>
            <p className="eyebrow">Digital Twin · Smart Factory · Industrial IoT</p>
            <h1>데이터로 연결하는<br /><span>제조 디지털 혁신</span></h1>
            <p className="lead">(주)인지아이앤에스는 디지털 트윈, 스마트팩토리와 품질 데이터 플랫폼을 기반으로 제조 현장의 디지털 전환을 지원합니다.</p>
            <div className="button-row"><Link className="button button--gold" href="/contact">사업 상담</Link><Link className="button button--ghost" href="/diagnosis">제조 DX 사전진단</Link></div>
          </div>
          <div className="hero-art" aria-hidden="true"><div className="hero-art__window"><i /><i /><i /><span /></div><div className="hero-art__card hero-art__card--one">Digital Twin</div><div className="hero-art__card hero-art__card--two">Quality Data</div></div>
        </div>
      </section>

      <section className="section section--ink">
        <div className="container">
          <SectionHeading eyebrow="Manufacturing DX" title="제품과 공정의 데이터를 하나의 흐름으로 연결합니다" description="개발부터 생산과 품질, 협력사 업무까지 이어지는 정보를 현장에서 활용할 수 있도록 구성합니다." />
          <div className="problem-grid">
            <article><b>01</b><h3>분산된 품질 데이터</h3><p>개발, 생산과 고객 품질 정보가 여러 시스템과 문서에 나뉘어 문제 추적이 늦어집니다.</p></article>
            <article><b>02</b><h3>검증하기 어려운 공정</h3><p>실제 설비를 변경하기 전에 제품과 공정 조건을 비교하고 확인할 환경이 필요합니다.</p></article>
            <article><b>03</b><h3>연결되지 않은 현장</h3><p>설비와 센서 데이터가 수집되어도 분석, 협업과 의사결정에 충분히 활용되지 못합니다.</p></article>
          </div>
        </div>
      </section>

      <section className="section"><div className="container"><SectionHeading eyebrow="Core Services" title="제조 현장에 필요한 디지털 기반을 구축합니다" description="디지털 트윈, 품질경영 시스템과 IoT·클라우드 플랫폼을 기업 환경에 맞게 연결합니다." /><div className="card-grid">{services.map((service, index) => <Link className="service-card" href={`/services/${service.slug}`} key={service.slug}><span>0{index + 1}</span><h3>{service.title}</h3><p>{service.summary}</p><strong>자세히 보기 →</strong></Link>)}</div></div></section>

      <section className="section section--soft"><div className="container split-feature"><div><p className="eyebrow">DX Readiness Check</p><h2>구축 전에<br />현장과 데이터를 진단합니다.</h2><p>현재 시스템, 품질 업무와 데이터 활용 수준을 확인하고 우선 적용할 영역을 정리합니다.</p><Link className="text-link" href="/diagnosis">제조 DX 사전진단 신청 →</Link></div><div className="score-card"><span>DX CHECK</span><strong>5</strong><small>가지 핵심 영역 검토</small></div></div></section>

      <section className="section"><div className="container"><SectionHeading eyebrow="Business Models" title="사업 모델과 적용 분야" description="제공 자료를 바탕으로 인지아이앤에스가 추진하는 제조혁신 사업 영역을 정리했습니다." /><div className="content-grid">{portfolioItems.map((item) => <Link className="content-card" href={`/portfolio/${item.slug}`} key={item.slug}><div className={`visual visual--${item.tone}`}><span>{item.label}</span></div><div><h3>{item.title}</h3><p>{item.summary}</p><strong>내용 보기 →</strong></div></Link>)}</div><div className="section-action"><Link className="button button--outline" href="/portfolio">사업 분야 전체 보기</Link></div></div></section>

      <section className="section section--navy"><div className="container split-feature"><div><p className="eyebrow">Consulting & Training</p><h2>기술 도입을 위한<br />교육과 컨설팅</h2><p>제조 데이터와 품질 업무를 이해하고 현장에 적용할 수 있도록 진단, 교육과 구축 방향 수립을 지원합니다.</p><Link className="button button--gold" href="/education">교육·컨설팅 확인</Link></div><ol className="step-list"><li><span>01</span>현장과 업무 현황 확인</li><li><span>02</span>데이터와 품질 과제 정리</li><li><span>03</span>적용 기술과 시스템 설계</li><li><span>04</span>구축·운영 단계 지원</li></ol></div></section>

      <section className="section"><div className="container"><SectionHeading eyebrow="Insights" title="제조 디지털 전환의 핵심 기술" /><div className="blog-grid">{blogPosts.slice(0, 3).map((post) => <Link href={`/blog/${post.slug}`} key={post.slug}><span>{post.category}</span><h3>{post.title}</h3><p>{post.summary}</p><strong>글 읽기 →</strong></Link>)}</div></div></section>

      <section className="final-cta"><div className="container"><p className="eyebrow">Start a Project</p><h2>제조 현장의 과제를<br />함께 검토하겠습니다.</h2><p>도입 범위가 정리되지 않아도 현재 시스템과 해결하려는 문제부터 확인할 수 있습니다.</p><Link className="button button--gold" href="/contact">사업 상담 시작</Link></div></section>
    </main>
  );
}
