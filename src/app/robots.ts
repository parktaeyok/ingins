import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/complete"] }, sitemap: "https://cursamanworks.kr/sitemap.xml" }; }
