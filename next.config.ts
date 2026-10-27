import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const dev = process.env.NODE_ENV !== "production";
const apiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? "").origin;
  } catch {
    return "";
  }
})();

// The Content-Security-Policy is set per request by src/proxy.ts (src/lib/csp.ts), with a fresh script nonce.

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Camera and microphone are used by our own pages (profile photo, voice messages); nothing else.
  { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(), payment=(self), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  ...(dev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

/** Account and admin areas: never shown in search results (robots.txt also asks crawlers to skip them). */
const PRIVATE = ["admin", "settings", "messages", "notifications", "favorites", "my-projects", "offers", "profile", "teams", "disputes", "payments", "r"];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    authInterrupts: true,
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      ...PRIVATE.flatMap((area) => [`/${area}/:path*`, `/ar/${area}/:path*`]).map((source) => ({
        source,
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      })),
    ];
  },
};

export default withNextIntl(nextConfig);
