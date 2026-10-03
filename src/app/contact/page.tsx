import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { SubmissionForm } from "@/components/submission-form";
export const metadata: Metadata = { title: "문의하기", description: "디지털 트윈, 스마트팩토리, DQMS와 산업 IoT 사업 문의" };
export default function ContactPage() { return <main id="main-content"><PageHero eyebrow="Contact" title="제조 현장의 과제와 도입 목표를 알려주세요" description="범위가 정리되지 않았어도 현재 시스템과 해결하려는 문제부터 함께 검토하겠습니다." /><section className="section"><div className="container form-layout"><aside><p className="eyebrow">Business Inquiry</p><h2>사업 문의</h2><p>내용 확인 후 안내드리겠습니다.</p><div className="contact-list"><p><b>회사명</b>(주)인지아이앤에스</p><p><b>대표이사</b>박태억</p><p><b>사업자등록번호</b>617-81-80010</p><p><b>주소</b>48231 부산광역시 수영구 망미번영로52번길 26, 2층(수영동)</p><p><b>Mobile</b><a href="tel:+821041031567">010-4103-1567</a></p><p><b>E-mail</b><a href="mailto:taeyok@naver.com">taeyok@naver.com</a></p></div></aside><SubmissionForm kind="inquiry" /></div></section></main>; }
