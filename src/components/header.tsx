"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [["/services", "서비스"], ["/diagnosis", "AX 진단"], ["/education", "교육·컨설팅"], ["/portfolio", "적용 분야"], ["/blog", "AX 인사이트"], ["/about", "회사소개"], ["/signup", "회원가입"]];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  function closeMenus() { setOpen(false); setSubmenuOpen(false); }
  useEffect(() => { const close = (event: KeyboardEvent) => { if(event.key === "Escape") { setOpen(false); setSubmenuOpen(false); } }; document.addEventListener("keydown", close); return () => document.removeEventListener("keydown", close); }, []);
  return <header className="site-header"><div className="container header-inner"><Link className="brand" href="/" aria-label="(주)인지아이앤에스 홈" onClick={closeMenus}><span>I&amp;S</span><b>(주)인지아이앤에스</b></Link><nav id="primary-navigation" className={open ? "nav is-open" : "nav"} aria-label="주요 메뉴"><ul>{links.map(([href, label]) => <li key={href} className={href==="/about"?"nav-group":undefined} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setSubmenuOpen(false);}}><Link href={href} onClick={closeMenus} aria-current={pathname.startsWith(href) ? "page" : undefined}>{label}</Link>{href==="/about"&&<><button className="nav-submenu-toggle" type="button" aria-label="회사소개 하위 메뉴" aria-expanded={submenuOpen} aria-controls="company-submenu" onClick={()=>setSubmenuOpen(value=>!value)}>⌄</button><ul id="company-submenu" className="nav-submenu" hidden={!submenuOpen}><li><Link href="/board/" onClick={closeMenus} aria-current={pathname.startsWith("/board")?"page":undefined}>게시판 <span aria-hidden="true">→</span></Link></li></ul></>}</li>)}</ul></nav><Link className="button button--small header-cta" href="/contact">AX 도입 상담</Link><button className="menu-button" type="button" aria-expanded={open} aria-controls="primary-navigation" onClick={() => { setOpen(!open); setSubmenuOpen(false); }}><span /><span /><span /><b className="sr-only">메뉴 {open ? "닫기" : "열기"}</b></button></div></header>;
}
