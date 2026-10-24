export const SESSION_COOKIE = "motamakin_session";

export const PROTECTED_PATHS = [
  /^\/projects\/\d+\/edit(\/|$)/,
  /^\/projects\/invitations(\/|$)/,
  /^\/(messages|my-projects|offers|profile|teams|settings|disputes|notifications|favorites|admin|payments|support)(\/|$)/,
];

export const GUEST_ONLY_PATHS = [/^\/(login|admin-login|signup|forgot-password|reset-password)(\/|$)/];

export const AFTER_LOGIN_PATH = "/";

/** Staff sign in here, not on the public sign-in page: no sign-up link, and the admin panel afterwards. */
export const ADMIN_LOGIN_PATH = "/admin-login";

const ADMIN_PATH = /^\/admin(\/|$)/;

/** Whether a path is inside the admin panel (its sign-in page included). */
export function isAdminPath(path: string): boolean {
  return ADMIN_PATH.test(path) || path === ADMIN_LOGIN_PATH;
}

/** Where to go after signing in: the page asked for, else the admin panel for staff and the home page for everyone else. */
export function afterLoginPath(next: string | undefined, isAdmin: boolean | undefined): string {
  return next ?? (isAdmin ? "/admin" : AFTER_LOGIN_PATH);
}

/** The `next` redirect target if it is a path on this site; anything that could lead to another site gives undefined. */
export function safeNextPath(value: string | string[] | undefined | null) {
  // Only paths on this site: "//evil.com" and "/\\evil.com" would send the browser to another site.
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !/[\\\s]/.test(value) ? value : undefined;
}
