"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { afterLoginPath } from "@/lib/session";
import { rememberWelcome } from "@/lib/welcome";
import { createSession } from "../actions";
import { rememberReferral } from "../lib/referral";
import { AuthError, authService } from "../services/auth.service";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const SCRIPT = "https://accounts.google.com/gsi/client";

type GoogleId = {
  initialize: (options: { client_id: string; callback: (response: { credential: string }) => void; ux_mode?: string }) => void;
  renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

/** Loads Google's sign-in script once for the whole page. */
function loadScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`);
    const script = existing ?? Object.assign(document.createElement("script"), { src: SCRIPT, async: true });
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject());
    if (!existing) document.head.appendChild(script);
  });
}

/**
 * "Continue with Google" under the login and sign-up forms (POST /auth/google): Google confirms the email, so the user
 * is signed in, or gets an account, at once. Hidden when no Google client ID is configured.
 */
export function GoogleSignIn({ next }: { next?: string }) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        const id = window.google?.accounts.id;
        if (cancelled || !id || !box.current) return;
        id.initialize({
          client_id: CLIENT_ID,
          callback: async ({ credential }) => {
            setError(null);
            try {
              const { accessToken, user } = await authService.google({ credential, referralCode: rememberReferral(undefined) });
              await createSession(accessToken);
              rememberWelcome(user.fullName ?? user.username ?? "");
              router.replace(afterLoginPath(next, user.isAdmin));
            } catch (caught) {
              setError(caught instanceof AuthError && caught.message ? caught.message : t("googleFailed"));
            }
          },
        });
        id.renderButton(box.current, { theme: "outline", size: "large", shape: "rectangular", text: "continue_with", locale, width: 280 });
      })
      .catch(() => !cancelled && setError(t("googleFailed")));
    return () => {
      cancelled = true;
    };
  }, [locale, next, router, t]);

  if (!CLIENT_ID) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full items-center gap-3 text-sm text-muted">
        <span className="h-px flex-1 bg-border" />
        {t("orContinueWith")}
        <span className="h-px flex-1 bg-border" />
      </div>
      <div ref={box} className="flex min-h-[44px] justify-center" />
      {error && <p className="text-center text-sm text-danger">{error}</p>}
    </div>
  );
}
