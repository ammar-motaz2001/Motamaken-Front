export const SESSION_COOKIE = "motamakin_session";

export const PROTECTED_PATHS = [
  /^\/projects\/\d+\/edit(\/|$)/,
  /^\/projects\/invitations(\/|$)/,
  /^\/(messages|my-projects|offers|profile|teams|settings|disputes|notifications|favorites|admin|payments)(\/|$)/,
];

export const GUEST_ONLY_PATHS = [/^\/(login|signup|forgot-password|reset-password)(\/|$)/];

export const AFTER_LOGIN_PATH = "/";

export function safeNextPath(value: string | string[] | undefined | null) {
  // Only paths on this site: "//evil.com" and "/\\evil.com" would send the browser to another site.
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !/[\\\s]/.test(value) ? value : undefined;
}
