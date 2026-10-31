import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { contentSecurityPolicy } from "./lib/csp";
import { routing } from "./i18n/routing";
import { ADMIN_HOST_PATHS, ADMIN_LOGIN_PATH, AFTER_LOGIN_PATH, GUEST_ONLY_PATHS, PROTECTED_PATHS, SESSION_COOKIE, isAdminHost, isAdminPath, safeNextPath } from "./lib/session";

const intl = createMiddleware(routing);
const LOCALE_PREFIX = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);

/**
 * Runs before every page: the admin address only serves the panel, guests opening a private page go to sign in (with
 * `next`; the staff sign-in page for the admin panel), signed-in users skip the auth pages, then locale routing.
 */
export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const prefix = pathname.match(LOCALE_PREFIX)?.[0] ?? "";
  const path = pathname.slice(prefix.length) || "/";
  const signedIn = request.cookies.has(SESSION_COOKIE);

  // A `next` that is not a path on this site (https://evil.com, //evil.com) is dropped before the page sees it.
  const next = request.nextUrl.searchParams.get("next");
  if (next !== null && !safeNextPath(next)) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  // The admin address (admin.mutamakin.com) only serves the panel and the sign-in steps it needs: anything else there
  // (the home page, the public sign-in, a project...) opens the panel, or the staff sign-in for guests.
  if (isAdminHost(request.headers.get("x-forwarded-host") ?? request.headers.get("host")) && !ADMIN_HOST_PATHS.some((pattern) => pattern.test(path))) {
    return NextResponse.redirect(new URL(`${prefix}${signedIn ? "/admin" : ADMIN_LOGIN_PATH}`, request.url));
  }

  if (!signedIn && PROTECTED_PATHS.some((pattern) => pattern.test(path))) {
    const url = new URL(`${prefix}${isAdminPath(path) ? ADMIN_LOGIN_PATH : "/login"}`, request.url);
    url.searchParams.set("next", `${path}${search}`);
    return NextResponse.redirect(url);
  }

  if (signedIn && GUEST_ONLY_PATHS.some((pattern) => pattern.test(path))) {
    return NextResponse.redirect(new URL(`${prefix}${isAdminPath(path) ? "/admin" : AFTER_LOGIN_PATH}`, request.url));
  }

  // A fresh nonce per page: Next.js puts it on its own scripts, and only scripts carrying it may run.
  const nonce = btoa(crypto.randomUUID());
  const csp = contentSecurityPolicy(nonce);
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  const response = intl(new NextRequest(request, { headers }));
  response.headers.set("Content-Security-Policy", csp);
  // Nothing in the browser reads the language cookie: mark it HttpOnly so scripts cannot either.
  const locale = response.cookies.get("NEXT_LOCALE");
  if (locale) response.cookies.set({ ...locale, httpOnly: true });
  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|images|.*\\..*).*)",
};
