export const SESSION_COOKIE = "motamakin_session";

export const PROTECTED_PATHS = [/^\/projects(\/|$)/];

export const GUEST_ONLY_PATHS = [/^\/(login|signup|forgot-password|reset-password)(\/|$)/];

export const AFTER_LOGIN_PATH = "/projects/new";

export function safeNextPath(value: string | string[] | undefined | null) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : undefined;
}
