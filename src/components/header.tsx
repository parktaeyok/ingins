"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useMember } from "@/components/member-session";
import { blogPosts } from "@/lib/site-data";

const links = [
  { href: "/services", label: "서비스", children: [
    { href: "/services/manufacturing-ai-assistant", label: "제조 업무 AI 도우미" },
    { href: "/services/pms-qms-scm", label: "PMS · QMS · SCM 연결" },
    { href: "/services/advanced-manufacturing-analytics", label: "제조 AI 분석" },
  ] },
  { href: "/diagnosis", label: "AX 진단", children: [
    { href: "/diagnosis/#diagnosis-check", label: "현장·데이터 점검" },
    { href: "/diagnosis/#implementation", label: "도입 절차" },
    { href: "/diagnosis/#diagnosis-apply", label: "사전진단 신청" },
  ] },
  { href: "/education", label: "교육·컨설팅", children: [
    { href: "/education/#training-topics", label: "교육·컨설팅 내용" },
    { href: "/education/#training-apply", label: "교육 신청" },
  ] },
  { href: "/portfolio", label: "적용 분야", children: [
    { href: "/portfolio/production-report", label: "생산 보고서 자동 작성" },
    { href: "/portfolio/quality-document-search", label: "품질문서 검색" },
    { href: "/portfolio/delivery-quality-inventory", label: "납기·품질·재고 분석" },
  ] },
  { href: "/blog", label: "AX 인사이트", children: blogPosts.map(post => ({ href: `/blog/${post.slug}`, label: post.title })) },
  { href: "/about", label: "회사소개", children: [
    { href: "/about/#about-business", label: "사업 방향" },
    { href: "/about/#company-info", label: "사업자 정보" },
  ] },
];

export function Header() {
  const pathname = usePathname().replace(/\/$/, "");
  const [open, setOpen] = useState(false);
  const { user, profile } = useMember();
  const memberLinks = [
    { href: "/board", label: "게시글 목록" },
    { href: "/board/new", label: "새 글 작성" },
    ...(user ? [{ href: "/account", label: "내 정보·로그아웃" }] : [{ href: "/signup", label: "회원가입" }, { href: "/auth", label: "로그인" }]),
    ...(profile?.role === "admin" ? [{ href: "/admin/members", label: "회원 관리" }] : []),
  ];
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);
  return <header className="site-header"><div className="container header-inner">
    <Link className="brand" href="/" aria-label="(주)인지아이앤에스 홈" onClick={() => setOpen(false)}><span>I&amp;S</span><b>(주)인지아이앤에스</b></Link>
    <nav id="primary-navigation" className={open ? "nav is-open" : "nav"} aria-label="주요 메뉴">
      <p className="nav-caption">바로가기 <span>클릭 ↗ · 아래로 스크롤 ↓</span></p>
      <ul>{[...links, { href: "/board", label: "회원·게시판", children: memberLinks }].map(item => <li className="nav-group" key={item.href}>
        <Link className="nav-group-title" href={item.href} data-active={pathname === item.href || pathname.startsWith(`${item.href}/`) || undefined} aria-current={pathname === item.href ? "page" : undefined} onClick={() => setOpen(false)}><span>{item.label}</span><span className="nav-arrow" aria-hidden="true">→</span></Link>
        <ul className="nav-submenu" aria-label={`${item.label} 하위 메뉴`}>{item.children.map((child, index) => <li key={child.href}><Link href={child.href} onClick={() => setOpen(false)} aria-current={!child.href.includes("#") && pathname === child.href ? "page" : undefined}><span className="nav-point" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><span>{child.label}</span><span className="nav-arrow" aria-hidden="true">↗</span></Link></li>)}</ul>
      </li>)}</ul>
    </nav>
    <div className="header-actions"><Link className="button button--small" href={user ? "/account/" : "/signup/"}>{user ? "내 정보" : "회원가입 →"}</Link><Link className="button button--small header-cta" href="/contact">AX 도입 상담 →</Link></div>
    <button className="menu-button" type="button" aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(value => !value)}><span /><span /><span /><b className="sr-only">메뉴 {open ? "닫기" : "열기"}</b></button>
  </div></header>;
}
