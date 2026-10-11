import type { AuthMethod, LoginPayload, OtpPurpose, SignupPayload } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class AuthError extends Error {}

export type AuthUser = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string | null;
  phone: string | null;
  points: number;
};

async function request<T>(path: string, body: unknown): Promise<T> {
  if (!API_URL) throw new AuthError();

  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Language": document.documentElement.lang,
    },
    credentials: "include",
    body: JSON.stringify(body),
  }).catch(() => {
    throw new AuthError();
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new AuthError(typeof data?.message === "string" ? data.message : undefined);
  return data as T;
}

export const authService = {
  recordReferralVisit(code: string) {
    return request<{ recorded: boolean }>("/affiliate/visits", { code });
  },

  signup(payload: SignupPayload) {
    return request<{ target: string }>("/auth/signup", payload);
  },

  login(payload: LoginPayload) {
    return request<{ accessToken?: string; otpRequired?: boolean; twoFactor?: { method: AuthMethod; target: string } }>("/auth/login", payload);
  },

  verifyOtp(payload: { purpose: OtpPurpose; method: AuthMethod; target: string; code: string }) {
    return request<{ token?: string; accessToken?: string; user?: AuthUser }>("/auth/otp/verify", payload);
  },

  resendOtp(payload: { purpose: OtpPurpose; method: AuthMethod; target: string }) {
    return request<{ sent: boolean }>("/auth/otp/resend", payload);
  },

  requestPasswordReset(payload: { method: AuthMethod; target: string }) {
    return request<{ sent?: boolean; token?: string }>("/auth/password/forgot", payload);
  },

  resetPassword(payload: { token: string; password: string }) {
    return request<{ success: boolean }>("/auth/password/reset", payload);
  },
};
