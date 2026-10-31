"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

/** Header counts that get no event of their own (new offers, messages): refreshed every 30 s while the tab is shown. */
const EVERY_MS = 30_000;

/**
 * Keeps the signed-in header's counts current without a page reload: refreshes the server data every half minute
 * while the tab is visible, and as soon as the user comes back to it. Typing and open menus are kept by the refresh.
 */
export function LiveCounts() {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => document.visibilityState === "visible" && router.refresh();
    const timer = window.setInterval(refresh, EVERY_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);

  return null;
}
