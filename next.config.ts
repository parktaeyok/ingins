import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co; frame-ancestors 'self'; base-uri 'self'; form-action 'self'" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  trailingSlash: true,
  turbopack: { root: process.cwd() },
  async redirects() {
    const paths = [
      ["/services/digital-twin", "/services/advanced-manufacturing-analytics"],
      ["/services/smart-factory-quality", "/services/pms-qms-scm"],
      ["/services/iot-platform", "/services/pms-qms-scm"],
      ["/portfolio/sharing-digital-factory", "/portfolio"],
      ["/portfolio/apqp-dqms", "/portfolio/quality-document-search"],
      ["/portfolio/industrial-iot", "/portfolio"],
      ["/blog/digital-twin-manufacturing", "/blog/manufacturing-ax-first-step"],
      ["/blog/apqp-dqms-quality-data", "/blog/quality-rag-and-permissions"],
      ["/blog/sharing-digital-factory-guide", "/blog/manufacturing-ax-first-step"],
      ["/blog/industrial-iot-convergence", "/blog/prediction-data-readiness"],
    ];
    return paths.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
  async headers() { return [{ source: "/:path*", headers: securityHeaders }]; },
};

export default nextConfig;
