import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/complete"] }, sitemap: `${(process.env.NEXT_PUBLIC_SITE_URL ?? "https://cursamanworks.kr").replace(/\/$/, "")}/sitemap.xml` }; }
