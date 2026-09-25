import type { AuthMethod, LoginPayload, OtpPurpose, SignupPayload } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class AuthError extends Error {}

async function request<T>(path: string, body: unknown, mock: () => T): Promise<T> {
  if (!API_URL) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return mock();
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept-Language": document.documentElement.lang },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new AuthError(data?.message);
  return data as T;
}

export const authService = {
  signup(payload: SignupPayload) {
    return request<{ target: string }>("/auth/signup", payload, () => ({
      target: payload.method === "email" ? payload.email! : payload.phone!,
    }));
  },

  login(payload: LoginPayload) {
    return request<{ accessToken: string }>("/auth/login", payload, () => ({ accessToken: "mock-token" }));
  },

  verifyOtp(payload: { purpose: OtpPurpose; method: AuthMethod; target: string; code: string }) {
    return request<{ token?: string }>("/auth/otp/verify", payload, () => {
      if (payload.code === "0000") throw new AuthError();
      return { token: "mock-reset-token" };
    });
  },

  resendOtp(payload: { purpose: OtpPurpose; method: AuthMethod; target: string }) {
    return request<{ sent: boolean }>("/auth/otp/resend", payload, () => ({ sent: true }));
  },

  requestPasswordReset(payload: { method: AuthMethod; target: string }) {
    return request<{ token?: string }>("/auth/password/forgot", payload, () => ({
      token: payload.method === "email" ? "mock-reset-token" : undefined,
    }));
  },

  resetPassword(payload: { token: string; password: string }) {
    return request<{ success: boolean }>("/auth/password/reset", payload, () => ({ success: true }));
  },
};
