import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { SubmissionForm } from "@/components/submission-form";
export const metadata: Metadata = { title: "문의하기", description: "생산 보고서 자동 작성, 품질문서 검색과 제조 AX 도입 상담" };
export default function ContactPage() { return <main id="main-content"><PageHero eyebrow="Contact" title="제조 현장의 과제와 도입 목표를 알려주세요" description="공장 1곳의 반복 업무부터 검토합니다. 현재 자료와 사용 시스템, 가장 개선하고 싶은 업무를 알려주세요." /><section className="section"><div className="container form-layout"><aside><p className="eyebrow">Business Inquiry</p><h2>AX 도입 상담</h2><p>내용 확인 후 안내드리겠습니다.</p><div className="contact-list"><p><b>회사명</b>(주)인지아이앤에스</p><p><b>대표이사</b>박태억</p><p><b>사업자등록번호</b>617-81-80010</p><p><b>주소</b>48231 부산광역시 수영구 망미번영로52번길 26, 2층(수영동)</p><p><b>Mobile</b><a href="tel:+821041031567">010-4103-1567</a></p><p><b>E-mail</b><a href="mailto:taeyok@naver.com">taeyok@naver.com</a></p></div></aside><SubmissionForm kind="inquiry" /></div></section></main>; }
