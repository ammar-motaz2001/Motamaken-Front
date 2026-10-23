"use client";

import { useEffect, useState } from "react";

/** How long a popover takes to fade out (matches .pop-leave in globals.css). */
const LEAVE_MS = 120;

/**
 * Keeps a popover in the page for a moment after it closes so it can fade out: `mounted` says whether to render it,
 * `leaving` whether to give it the closing animation (`pop-leave`).
 */
export function usePresence(open: boolean) {
  const [mounted, setMounted] = useState(open);
  // Opening shows it at once (state adjusted while rendering, as React recommends).
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (open) return;
    const timer = window.setTimeout(() => setMounted(false), LEAVE_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  return { mounted: open || mounted, leaving: !open && mounted };
}
