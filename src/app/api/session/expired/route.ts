import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

/** GET /api/session/expired: drops the session cookie and sends the user to sign in. */
export async function GET(request: NextRequest) {
  (await cookies()).delete(SESSION_COOKIE);
  return NextResponse.redirect(new URL("/login", request.url));
}
