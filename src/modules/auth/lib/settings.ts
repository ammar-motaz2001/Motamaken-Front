import type { AuthMethod } from "../types";

export async function getAuthMethods(): Promise<AuthMethod[]> {
  return process.env.PHONE_AUTH_ENABLED === "true" ? ["email", "phone"] : ["email"];
}
