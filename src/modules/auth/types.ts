import type { ValidationKey } from "./lib/validation";

export type AuthMethod = "email" | "phone";

export type OtpPurpose = "signup" | "login" | "reset" | "quick";

export type SignupPayload = {
  method: AuthMethod;
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
  phone?: string;
  password: string;
  subscribe: boolean;
  referralCode?: string;
  recaptchaToken?: string;
};

export type LoginPayload = {
  method: AuthMethod;
  identifier: string;
  password: string;
};

export type FieldErrors<T extends string> = Partial<Record<T, ValidationKey>>;

const AUTH_METHODS: readonly AuthMethod[] = ["email", "phone"];

/** Sign-in method from the URL; anything unknown or switched off falls back to the given default or the first allowed method. */
export function parseMethod(
  value: string | string[] | undefined,
  fallback: AuthMethod,
  allowed: readonly AuthMethod[] = AUTH_METHODS,
): AuthMethod {
  const method = value === "email" || value === "phone" ? value : fallback;
  return allowed.includes(method) ? method : allowed[0];
}
