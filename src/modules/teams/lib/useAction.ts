"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import type { ApiError } from "@/lib/api/errors";

/** Runs a team action with a busy key and error message, then runs `after` or refreshes the page. */
export function useAction(fallbackError: string) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (key: string, action: () => Promise<unknown>, after?: () => void) => {
    setBusy(key);
    setError(null);
    try {
      await action();
      if (after) after();
      else router.refresh();
      return true;
    } catch (caught) {
      setError((caught as ApiError).message || fallbackError);
      return false;
    } finally {
      setBusy(null);
    }
  };

  return { busy, error, run };
}
