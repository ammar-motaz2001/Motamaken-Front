const PROXY_SECRET = process.env.API_PROXY_SECRET;

/**
 * The visitor's IP, browser and country for the API, which otherwise only sees this server's address (and would apply
 * rate limits and visit filters to all visitors at once). Signed with a secret shared with the API so the values cannot
 * be forged by calling it directly. Server-only: the secret never reaches the browser.
 */
export function visitorHeaders(incoming: Headers): Record<string, string> {
  if (!PROXY_SECRET) return {};

  const ip = incoming.get("x-forwarded-for")?.split(",")[0]?.trim() || incoming.get("x-real-ip") || "";
  const country = incoming.get("x-vercel-ip-country") || incoming.get("cf-ipcountry") || "";
  const agent = incoming.get("user-agent") || "";

  return {
    "x-proxy-secret": PROXY_SECRET,
    ...(ip ? { "x-client-ip": ip } : {}),
    ...(country ? { "x-client-country": country } : {}),
    ...(agent ? { "x-client-user-agent": agent } : {}),
  };
}
