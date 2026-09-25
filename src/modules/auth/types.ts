import type { ValidationKey } from "./lib/validation";

export type AuthMethod = "email" | "phone";

export type OtpPurpose = "signup" | "reset";

export type SignupPayload = {
  method: AuthMethod;
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
  phone?: string;
  password: string;
  subscribe: boolean;
};

export type LoginPayload = {
  method: AuthMethod;
  identifier: string;
  password: string;
};

export type FieldErrors<T extends string> = Partial<Record<T, ValidationKey>>;

export function parseMethod(value: string | string[] | undefined, fallback: AuthMethod): AuthMethod {
  return value === "email" || value === "phone" ? value : fallback;
}
