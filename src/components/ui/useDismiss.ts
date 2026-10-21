"use client";

import { useEffect, type RefObject } from "react";

/** Closes a popup when the user clicks outside it or presses Escape, while it is open. */
export function useDismiss(open: boolean, ref: RefObject<HTMLElement | null>, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, ref, close]);
}
