import { forbidden, notFound } from "next/navigation";
import { getSummary } from "@/lib/api/reference";
import { ApiError } from "@/lib/api/errors";
import { apiGet } from "@/lib/api/server";

/** What the signed-in staff member may use in the panel. */
export async function getAdminPermissions(): Promise<Set<string>> {
  return new Set((await getSummary())?.user.adminPermissions ?? []);
}

/** Reads an admin endpoint; a section outside the staff member's role shows the "forbidden" page, a missing record 404. */
export async function adminGet<T>(path: string): Promise<T> {
  try {
    return await apiGet<T>(path);
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) forbidden();
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}
