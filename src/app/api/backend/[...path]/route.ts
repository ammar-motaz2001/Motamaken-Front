import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { visitorHeaders } from "@/lib/api/visitor";
import { SESSION_COOKIE } from "@/lib/session";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
const FORWARDED_HEADERS = ["accept", "accept-language", "content-type"];

async function forward(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  if (!API_URL) return Response.json({ message: "API is not configured" }, { status: 503 });

  const { path } = await params;
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  const headers = new Headers();
  FORWARDED_HEADERS.forEach((name) => {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  });
  if (token) headers.set("authorization", `Bearer ${token}`);
  Object.entries(visitorHeaders(request.headers)).forEach(([name, value]) => headers.set(name, value));

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const response = await fetch(`${API_URL}/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    cache: "no-store",
  }).catch(() => null);

  if (!response) return Response.json({ message: "Service unavailable" }, { status: 503 });
  if (response.status === 401 && token) store.delete(SESSION_COOKIE);

  return new Response(response.body, {
    status: response.status,
    headers: { "content-type": response.headers.get("content-type") ?? "application/json" },
  });
}

export { forward as DELETE, forward as GET, forward as PATCH, forward as POST, forward as PUT };
