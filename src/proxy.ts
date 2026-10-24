import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { ADMIN_LOGIN_PATH, AFTER_LOGIN_PATH, GUEST_ONLY_PATHS, PROTECTED_PATHS, SESSION_COOKIE, isAdminPath } from "./lib/session";

const intl = createMiddleware(routing);
const LOCALE_PREFIX = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);

/**
 * Runs before every page: guests opening a private page go to sign in (with `next`; the staff sign-in page for the admin
 * panel), signed-in users skip the auth pages, then locale routing.
 */
export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const prefix = pathname.match(LOCALE_PREFIX)?.[0] ?? "";
  const path = pathname.slice(prefix.length) || "/";
  const signedIn = request.cookies.has(SESSION_COOKIE);

  if (!signedIn && PROTECTED_PATHS.some((pattern) => pattern.test(path))) {
    const url = new URL(`${prefix}${isAdminPath(path) ? ADMIN_LOGIN_PATH : "/login"}`, request.url);
    url.searchParams.set("next", `${path}${search}`);
    return NextResponse.redirect(url);
  }

  if (signedIn && GUEST_ONLY_PATHS.some((pattern) => pattern.test(path))) {
    return NextResponse.redirect(new URL(`${prefix}${isAdminPath(path) ? "/admin" : AFTER_LOGIN_PATH}`, request.url));
  }

  return intl(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|images|.*\\..*).*)",
};
