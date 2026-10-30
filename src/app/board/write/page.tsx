import type { Metadata } from "next";
import { Suspense } from "react";
import { BoardEditor } from "@/components/board-editor";
import "../board.css";
export const metadata: Metadata = { title: "게시글 작성", robots: { index: false, follow: false } };
export default function WritePage() { return <main id="main-content" className="section board-section"><div className="container"><Suspense fallback={<p role="status">작성 화면을 준비하고 있습니다.</p>}><BoardEditor /></Suspense></div></main>; }
