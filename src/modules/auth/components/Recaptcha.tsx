"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

/** Without a site key the captcha is off: nothing is shown and forms send no token (the API does the same without a secret). */
export const recaptchaEnabled = Boolean(SITE_KEY);

/** Tokens are valid for two minutes; a fresh one is fetched before that. */
const REFRESH_MS = 100_000;

type Grecaptcha = {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

let loader: Promise<Grecaptcha> | null = null;

function loadScript() {
  loader ??= new Promise<Grecaptcha>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
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
  /** Gets a fresh token whenever one is ready, and null while none is. */
  onChange: (token: string | null) => void;
  /** Change it after a failed submit: tokens work only once, so a new one is fetched. */
  resetKey?: number;
  error?: string;
  /** What the form does, as reported to Google (letters and underscores). */
  action?: string;
};

/**
 * reCAPTCHA v3: invisible. Google scores the visit in the background and the API refuses low scores, so people never
 * solve a puzzle. Only Google's required notice is shown.
 */
export function Recaptcha({ onChange, resetKey = 0, error, action = "submit" }: RecaptchaProps) {
  const t = useTranslations("Auth");
  const callback = useRef(onChange);

  useEffect(() => {
    callback.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;
    const fetchToken = () =>
      loadScript()
        .then((grecaptcha) => grecaptcha.execute(SITE_KEY, { action }))
        .then((token) => !cancelled && callback.current(token))
        .catch(() => !cancelled && callback.current(null));

    void fetchToken();
    const timer = window.setInterval(fetchToken, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [resetKey, action]);

  if (!SITE_KEY) return null;

  return (
    <div className="flex flex-col gap-1">
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
      {error && (
        <p role="alert" className="font-hint text-xs font-light tracking-[0.6px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
