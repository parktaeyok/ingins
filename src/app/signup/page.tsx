import type { Metadata } from "next";
import { RegistrationForm } from "@/components/registration-form";
import "./registration.css";
export const metadata: Metadata = { title: "회원가입", robots: { index: false, follow: false } };
export default function SignupPage() { return <main id="main-content" className="register-page"><div className="container"><header className="register-heading"><p className="eyebrow">Join INGIN I&amp;S</p><h1>회원가입</h1><p>계정 정보와 연락처를 등록해주세요.<br />이메일 인증 없이 아이디와 비밀번호로 이용할 수 있습니다.</p><ol aria-label="가입 절차"><li><b>01</b> 정보 입력</li><li><b>02</b> 가입 완료</li><li><b>03</b> 로그인</li></ol></header><RegistrationForm /></div></main>; }
