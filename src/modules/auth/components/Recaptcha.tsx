"use client";

import { useLocale } from "next-intl";
import { useEffect, useRef } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

/** Without a site key the captcha is off: nothing is shown and forms send no token (the API does the same without a secret). */
export const recaptchaEnabled = Boolean(SITE_KEY);

type Grecaptcha = {
  render: (element: HTMLElement, options: Record<string, unknown>) => number;
  reset: (id?: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
    onRecaptchaReady?: () => void;
  }
}

let loader: Promise<Grecaptcha> | null = null;

function loadScript(locale: string) {
  loader ??= new Promise<Grecaptcha>((resolve, reject) => {
    window.onRecaptchaReady = () => resolve(window.grecaptcha!);
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaReady&render=explicit&hl=${locale}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      loader = null;
      reject(new Error("reCAPTCHA failed to load"));
    };
    document.head.appendChild(script);
  });
  return loader;
}

type RecaptchaProps = {
  /** Gets the token once ticked, and null when it expires. */
  onChange: (token: string | null) => void;
  /** Change it to show a fresh, unticked box (tokens work only once, so after every failed submit). */
  resetKey?: number;
  error?: string;
};

/** Google's "I'm not a robot" checkbox (reCAPTCHA v2), in the page's language and theme. */
export function Recaptcha({ onChange, resetKey = 0, error }: RecaptchaProps) {
  const locale = useLocale();
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<number | null>(null);
  const callback = useRef(onChange);

  useEffect(() => {
    callback.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!SITE_KEY) return;
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
      .catch(() => callback.current(null));
    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    if (resetKey && widget.current !== null) {
      window.grecaptcha?.reset(widget.current);
      callback.current(null);
    }
  }, [resetKey]);

  if (!SITE_KEY) return null;

  return (
    <div className="flex flex-col gap-1">
      <div ref={box} className="min-h-[78px]" />
      {error && (
        <p role="alert" className="font-hint text-xs font-light tracking-[0.6px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
