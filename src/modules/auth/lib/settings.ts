import type { AuthMethod } from "../types";

/** Sign-in methods switched on: email always, phone only when PHONE_AUTH_ENABLED is "true". */
export async function getAuthMethods(): Promise<AuthMethod[]> {
  return process.env.PHONE_AUTH_ENABLED === "true" ? ["email", "phone"] : ["email"];
}
