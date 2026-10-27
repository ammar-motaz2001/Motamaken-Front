"use client";

import type { ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";

const AUTH_PAGES = /^\/(login|signup|forgot-password|reset-password|admin-login)(\/|$)/;

/** Leaves out the search row and the main navigation on the sign-in, sign-up and password pages. */
export function HideOnAuthPages({ children }: { children: ReactNode }) {
  return AUTH_PAGES.test(usePathname()) ? null : <>{children}</>;
}
