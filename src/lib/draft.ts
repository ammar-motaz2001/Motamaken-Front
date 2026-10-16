"use client";

import { useCallback, useEffect, useState } from "react";

const PREFIX = "mutamakin:draft:";
const TTL_DAYS = 7;

/**
 * Like useState, but the value is also kept in localStorage for a week, so what a guest typed survives a reload, a
 * trip to the login page or a closed tab, and is there when they come back. `clear()` after the action succeeded.
 */
export function useDraft<T>(key: string | null, initial: T) {
  const [value, setValue] = useState<T>(initial);
  // Nothing is written until the saved draft was read back, or the empty form would overwrite it.
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    if (!key) return;
    try {
      const saved = JSON.parse(localStorage.getItem(PREFIX + key) ?? "null") as { value: T; until: number } | null;
      // Restoring after mount: the server render has no access to the browser's storage.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved && saved.until > Date.now()) setValue(saved.value);
    } catch {
      // Unreadable draft: start fresh.
    }
    setRestored(true);
  }, [key]);

  useEffect(() => {
    if (!key || !restored) return;
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify({ value, until: Date.now() + TTL_DAYS * 864e5 }));
    } catch {
      // Storage full or blocked: the form still works, it just isn't kept.
    }
  }, [key, value, restored]);

  const clear = useCallback(() => {
    if (!key) return;
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      // Nothing to clear.
    }
  }, [key]);

  return [value, setValue, clear] as const;
}
