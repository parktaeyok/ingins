import type { Metadata } from "next";
import { MemberAccess } from "@/components/member-access";
import "../signup/registration.css";
export const metadata:Metadata={title:"내 회원 정보",robots:{index:false,follow:false}};
export default function AccountPage(){return <main id="main-content" className="register-page"><div className="container"><MemberAccess account /></div></main>;}
