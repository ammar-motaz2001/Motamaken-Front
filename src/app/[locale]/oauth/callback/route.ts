import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
const MAX_AGE = 60 * 60 * 24 * 7;

export async function GET(request: NextRequest, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const prefix = locale === "en" ? "" : `/${locale}`;
  const code = request.nextUrl.searchParams.get("code");
  const failed = NextResponse.redirect(new URL(`${prefix}/login?oauth=failed`, request.url));

  if (!code || !API_URL) return failed;

  const response = await fetch(`${API_URL}/auth/oauth/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", "Accept-Language": locale },
    body: JSON.stringify({ code }),
    cache: "no-store",
  }).catch(() => null);
  const data = response?.ok ? await response.json().catch(() => null) : null;
  if (typeof data?.accessToken !== "string") return failed;

  (await cookies()).set(SESSION_COOKIE, data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return NextResponse.redirect(new URL(prefix || "/", request.url));
}
