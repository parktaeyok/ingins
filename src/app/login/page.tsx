import type { Metadata } from "next";
import { MemberAccess } from "@/components/member-access";
import "../signup/registration.css";
export const metadata:Metadata={title:"로그인",robots:{index:false,follow:false}};
export default function LoginPage(){return <main id="main-content" className="register-page"><div className="container"><MemberAccess /></div></main>;}
