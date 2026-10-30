/**
 * When this server reaches the API by an internal address (`http://api:10000`), tells it the public one so the links
 * it builds (signed KYC, dispute and chat files) open in the browser instead of pointing at the container.
 */
export const PUBLIC_HOST_HEADERS = ((): Record<string, string> => {
  const internal = process.env.API_URL;
  const pub = process.env.NEXT_PUBLIC_API_URL;
  if (!internal || !pub) return {};
  try {
    const url = new URL(pub);
    if (url.host === new URL(internal).host) return {};
    const https = url.protocol === "https:";
    return { "X-Forwarded-Host": url.hostname, "X-Forwarded-Proto": https ? "https" : "http", "X-Forwarded-Port": url.port || (https ? "443" : "80") };
  } catch {
    return {};
  }
})();
