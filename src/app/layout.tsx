import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://cursamanworks.kr"),
  title: { default: "(주)인지아이앤에스 | 제조 디지털 혁신", template: "%s | (주)인지아이앤에스" },
  description: "디지털 트윈, 스마트팩토리, APQP 기반 DQMS와 산업 IoT 플랫폼으로 제조 디지털 혁신을 지원합니다.",
  openGraph: { type: "website", locale: "ko_KR", siteName: "(주)인지아이앤에스" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body><a className="skip-link" href="#main-content">본문 바로가기</a><Header />{children}<Footer /></body></html>;
}
