"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session";

const MAX_AGE = 60 * 60 * 24 * 7;

export async function createSession(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  revalidatePath("/", "layout");
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
  revalidatePath("/", "layout");
}
