import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";
import "./ax.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://cursamanworks.kr"),
  title: { default: "(주)인지아이앤에스 | 중소 제조기업 AI · AX", template: "%s | (주)인지아이앤에스" },
  description: "PMS 생산관리, QMS 품질관리, SCM 공급망관리 데이터를 연결합니다. 생산 보고서 자동 작성과 품질문서 검색부터 중소 제조기업의 AX를 지원합니다.",
  openGraph: { type: "website", locale: "ko_KR", siteName: "(주)인지아이앤에스" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body><a className="skip-link" href="#main-content">본문 바로가기</a><Header />{children}<Footer /></body></html>;
}
