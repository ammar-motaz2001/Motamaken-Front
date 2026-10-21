"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { setMoyasarKey } from "@/lib/moyasar";

const MoyasarKey = createContext<string | null>(null);

/**
 * Hands the Moyasar publishable key of the mode the admins chose (test or live, from GET /site-settings) to the card
 * forms, so switching modes needs no rebuild. Null means card payments are off (the development flow is used).
 */
export function PaymentsProvider({ moyasarKey, children }: { moyasarKey: string | null; children: ReactNode }) {
  useEffect(() => {
    setMoyasarKey(moyasarKey);
  }, [moyasarKey]);

  return <MoyasarKey.Provider value={moyasarKey}>{children}</MoyasarKey.Provider>;
}

/** Whether card payments go through Moyasar (a publishable key is set for the mode in use). */
export function useMoyasarEnabled() {
  return Boolean(useContext(MoyasarKey));
}
