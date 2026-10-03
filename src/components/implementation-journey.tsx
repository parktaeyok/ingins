import { SectionHeading } from "@/components/section-heading";
import { implementationSteps } from "@/lib/ax-data";

export function ImplementationJourney() {
  return <section className="section section--navy"><div className="container"><SectionHeading eyebrow="Implementation" title="현장 진단부터 운영까지" description="한 공장·한 업무로 검증하고 결과에 따라 본 구축 범위를 결정합니다." /><div className="journey-grid">{implementationSteps.map((step, index) => <article key={step.title}><span>0{index + 1}</span><small>{step.period}</small><h3>{step.title}</h3><p>{step.description}</p></article>)}</div><p className="section-note">기간은 계획 기준이며 데이터 상태에 따라 조정합니다. 진단·시범 검증·본 구축은 별도 범위와 견적으로 진행하며, 센서·카메라·설치·추가 연동·대규모 정비·출장은 별도 협의합니다.</p><div className="verification-box"><h3>성공 기준은 착수 전에 함께 정합니다</h3><p>같은 업무와 유사 작업량에서 도입 전후 시간을 비교합니다. 보고서 수치 일치, 검색 답변의 근거·버전, 담당자 수정시간과 권한 준수를 확인합니다. 개선 목표는 고객의 업무와 데이터 상태에 맞게 협의합니다.</p></div></div></section>;
}
