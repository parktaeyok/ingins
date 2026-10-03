"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [["/services", "서비스"], ["/diagnosis", "AX 진단"], ["/education", "교육·컨설팅"], ["/portfolio", "적용 분야"], ["/blog", "AX 인사이트"], ["/about", "회사소개"]];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false); document.addEventListener("keydown", close); return () => document.removeEventListener("keydown", close); }, []);
  return <header className="site-header"><div className="container header-inner"><Link className="brand" href="/" aria-label="(주)인지아이앤에스 홈" onClick={() => setOpen(false)}><span>I&amp;S</span><b>(주)인지아이앤에스</b></Link><nav id="primary-navigation" className={open ? "nav is-open" : "nav"} aria-label="주요 메뉴"><ul>{links.map(([href, label]) => <li key={href}><Link href={href} onClick={() => setOpen(false)} aria-current={pathname.startsWith(href) ? "page" : undefined}>{label}</Link></li>)}</ul></nav><Link className="button button--small header-cta" href="/contact">AX 도입 상담</Link><button className="menu-button" type="button" aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(!open)}><span /><span /><span /><b className="sr-only">메뉴 {open ? "닫기" : "열기"}</b></button></div></header>;
}
