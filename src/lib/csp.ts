/**
 * The Content-Security-Policy for a page, with this request's nonce. Scripts: only ours carrying the nonce (and what
 * they load, via 'strict-dynamic'), Google reCAPTCHA and sign-in, and Cloudflare analytics; no inline scripts without the nonce.
 * Connections: this site, the API, Moyasar (card tokens) and Cloudflare analytics.
 */
export function contentSecurityPolicy(nonce: string): string {
  const dev = process.env.NODE_ENV !== "production";
  let apiOrigin = "";
  try {
    apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL ?? "").origin;
  } catch {
    apiOrigin = "";
  }

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.google.com https://www.gstatic.com https://accounts.google.com/gsi/client https://static.cloudflareinsights.com${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style",
    `img-src 'self' data: blob: https:${apiOrigin && dev ? ` ${apiOrigin}` : ""}`,
    "font-src 'self' data:",
    `connect-src 'self' ${apiOrigin} https://api.moyasar.com https://www.google.com https://accounts.google.com/gsi/ https://cloudflareinsights.com${dev ? " ws: http://localhost:*" : ""}`,
    `media-src 'self' blob: ${apiOrigin}`,
    "frame-src https://www.google.com https://recaptcha.google.com https://accounts.google.com/gsi/",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}
