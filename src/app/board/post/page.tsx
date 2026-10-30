import type { Metadata } from "next";
import { Suspense } from "react";
import { BoardDetail } from "@/components/board-detail";
import "../board.css";
export const metadata: Metadata = { title: "게시글", robots: { index: false, follow: true } };
export default function PostPage() { return <main id="main-content" className="section board-section"><div className="container"><Suspense fallback={<p role="status">게시글을 불러오고 있습니다.</p>}><BoardDetail /></Suspense></div></main>; }
