import type { Metadata } from "next";
import { AuthPanel } from "@/components/auth-panel";

export const metadata: Metadata = { title: "회원가입", description: "인지아이앤에스 회원으로 가입하고 제조 AX 게시판을 이용하세요.", robots: { index: false, follow: false } };

export default function SignupPage() {
  return <main id="main-content" className="signup-page"><div className="container signup-layout"><section className="signup-guide" aria-labelledby="signup-title"><p className="eyebrow">Welcome to INGIN I&amp;S</p><h1 id="signup-title">회원가입부터<br /> 시작해보세요.</h1><p className="signup-lead">간단한 정보를 등록하고, 제조 AX에 관한 질문과 현장 경험을 나눠보세요.</p><ol className="signup-steps" aria-label="회원가입 절차"><li><span>01</span><div><h2>회원 정보 입력</h2><p>이름·이메일·비밀번호를 입력해주세요.</p></div></li><li><span>02</span><div><h2>이메일 인증</h2><p>받은 편지함에서 인증 메일을 확인해주세요.</p></div></li><li><span>03</span><div><h2>로그인하고 이용하기</h2><p>게시판에 질문과 이야기를 남길 수 있어요.</p></div></li></ol><p className="signup-help">가입 중 도움이 필요하면<br /><a href="mailto:taeyok@naver.com">taeyok@naver.com</a>으로 문의해주세요.</p></section><section aria-label="회원가입 정보 입력"><AuthPanel initialMode="signup" signupOnly /></section></div></main>;
}
