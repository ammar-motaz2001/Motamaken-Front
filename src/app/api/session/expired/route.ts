import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * GET /api/session/expired: drops the session cookie and sends the user to sign in. The redirect is relative: behind
 * the reverse proxy this handler sees its own internal address (localhost:3000), not the public one.
 */
export async function GET() {
  (await cookies()).delete(SESSION_COOKIE);
  return new Response(null, { status: 307, headers: { Location: "/login" } });
}
