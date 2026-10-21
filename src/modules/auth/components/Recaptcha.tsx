"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
/** "2" shows Google's "I'm not a robot" checkbox (needs a v2 Checkbox key); anything else is the invisible v3. */
const CHECKBOX = process.env.NEXT_PUBLIC_RECAPTCHA_VERSION === "2";

/** Message key (Auth namespace) for a form sent before a token is ready: tick the box (v2) or wait for it to load (v3). */
export const recaptchaMissingMessage = CHECKBOX ? "recaptchaTick" : "recaptchaRequired";

/** Without a site key the captcha is off: nothing is shown and forms send no token (the API does the same without a secret). */
export const recaptchaEnabled = Boolean(SITE_KEY);

/** v3 tokens are valid for two minutes; a fresh one is fetched before that. */
const REFRESH_MS = 100_000;

type Grecaptcha = {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
  render: (element: HTMLElement, options: Record<string, unknown>) => number;
  reset: (id?: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

let loader: Promise<Grecaptcha> | null = null;

/** Loads Google's reCAPTCHA script once for the whole page (v2 in the page's language); a failed load can be retried. */
function loadScript(locale: string) {
  loader ??= new Promise<Grecaptcha>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKBOX
      ? `https://www.google.com/recaptcha/api.js?render=explicit&hl=${locale}`
      : `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.onload = () => window.grecaptcha!.ready(() => resolve(window.grecaptcha!));
    script.onerror = () => {
      loader = null;
      reject(new Error("reCAPTCHA failed to load"));
    };
    document.head.appendChild(script);
  });
  return loader;
}

type RecaptchaProps = {
  /** Gets a token when one is ready (v2: once ticked), and null while none is. */
  onChange: (token: string | null) => void;
  /** Change it after a failed submit: tokens work only once, so a new one is fetched (v2: the box is unticked). */
  resetKey?: number;
  error?: string;
  /** What the form does, as reported to Google with v3 (letters and underscores). */
  action?: string;
};

/**
 * reCAPTCHA on sign-up, quick start and contact. With a v2 key it is Google's "I'm not a robot" checkbox, which must
 * be ticked before the form can be sent; with a v3 key it is invisible and Google's badge plus a notice are shown.
 */
export function Recaptcha({ onChange, resetKey = 0, error, action = "submit" }: RecaptchaProps) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<number | null>(null);
  const callback = useRef(onChange);

  useEffect(() => {
    callback.current = onChange;
  }, [onChange]);

  // v2: draw the checkbox once.
  useEffect(() => {
    if (!SITE_KEY || !CHECKBOX) return;
    let cancelled = false;
    loadScript(locale)
      .then((grecaptcha) => {
        if (cancelled || !box.current || widget.current !== null) return;
        widget.current = grecaptcha.render(box.current, {
          sitekey: SITE_KEY,
          theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
          callback: (token: string) => callback.current(token),
          "expired-callback": () => callback.current(null),
          "error-callback": () => callback.current(null),
        });
      })
      .catch(() => !cancelled && callback.current(null));
    return () => {
      cancelled = true;
    };
  }, [locale]);

  // v2: a fresh, unticked box after a failed submit.
  useEffect(() => {
    if (CHECKBOX && resetKey && widget.current !== null) {
      window.grecaptcha?.reset(widget.current);
      callback.current(null);
    }
  }, [resetKey]);

  // v3: fetch a token now and keep it fresh.
  useEffect(() => {
    if (!SITE_KEY || CHECKBOX) return;
    let cancelled = false;
    const fetchToken = () =>
      loadScript(locale)
        .then((grecaptcha) => grecaptcha.execute(SITE_KEY, { action }))
        .then((token) => !cancelled && callback.current(token))
        .catch(() => !cancelled && callback.current(null));

    void fetchToken();
    const timer = window.setInterval(fetchToken, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [resetKey, action, locale]);

  if (!SITE_KEY) return null;

  return (
    <div className="flex flex-col gap-1">
      {CHECKBOX ? (
        <div ref={box} className="min-h-[78px]" />
      ) : (
        <p className="text-[11px] leading-snug text-muted">
          {t.rich("recaptchaNotice", {
            privacy: (chunks) => (
              <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline">
                {chunks}
              </a>
            ),
            terms: (chunks) => (
              <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="underline">
                {chunks}
              </a>
            ),
          })}
        </p>
      )}
      {error && (
        <p role="alert" className="font-hint text-xs font-light tracking-[0.6px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
