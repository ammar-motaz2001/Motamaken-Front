"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { rememberWelcome } from "@/lib/welcome";
import { createSession } from "@/modules/auth/actions";
import { QuickAuthModal, type QuickAuthResult } from "@/modules/auth/components/QuickAuthModal";
import type { AuthMethod } from "@/modules/auth/types";

type AuthGate = {
  signedIn: boolean;
  /**
   * Call it at a final button (publish, send, pay). Signed in: resolves true at once. Guest: opens the quick sign-up and
   * resolves true once they are signed in (their form stays as it is, so the action simply carries on), false if they
   * close it.
   */
  requireAuth: (reason?: string) => Promise<boolean>;
};

const AuthGateContext = createContext<AuthGate>({ signedIn: false, requireAuth: async () => false });

export function useAuthGate() {
  return useContext(AuthGateContext);
}

export function AuthGateProvider({ signedIn: initial, methods, children }: { signedIn: boolean; methods: AuthMethod[]; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState(initial);
  const [request, setRequest] = useState<{ reason?: string } | null>(null);
  const pending = useRef<((ok: boolean) => void) | null>(null);
  // A new server render (log in / log out elsewhere) wins over what this tab remembered.
  const [seen, setSeen] = useState(initial);
  if (seen !== initial) {
    setSeen(initial);
    setSignedIn(initial);
  }

  const requireAuth = useCallback(
    (reason?: string) => {
      if (signedIn) return Promise.resolve(true);
      pending.current?.(false);
      setRequest({ reason });
      return new Promise<boolean>((resolve) => {
        pending.current = resolve;
      });
    },
    [signedIn],
  );

  const settle = (ok: boolean) => {
    pending.current?.(ok);
    pending.current = null;
    setRequest(null);
  };

  const done = async ({ accessToken, name }: QuickAuthResult) => {
    await createSession(accessToken);
    rememberWelcome(name);
    setSignedIn(true);
    settle(true);
    // Header, wallet and menus pick up the account; the page's own state (the form being sent) is kept.
    router.refresh();
  };

  const value = useMemo(() => ({ signedIn, requireAuth }), [signedIn, requireAuth]);

  return (
    <AuthGateContext.Provider value={value}>
      {children}
      {request && (
        <QuickAuthModal open methods={methods} reason={request.reason} loginNext={pathname} onClose={() => settle(false)} onDone={done} />
      )}
    </AuthGateContext.Provider>
  );
}
