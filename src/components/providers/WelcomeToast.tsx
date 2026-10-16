"use client";

import { PartyPopper, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { WELCOME_EVENT, takeWelcome } from "@/lib/welcome";

/** "Welcome, Sara!" once, right after logging in or signing up. */
export function WelcomeToast() {
  const t = useTranslations("QuickAuth");
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const check = () => {
      const found = takeWelcome();
      if (found) setName(found);
    };
    // After a full page load (login redirects), and whenever someone signs in on this page.
    check();
    window.addEventListener(WELCOME_EVENT, check);
    return () => window.removeEventListener(WELCOME_EVENT, check);
  }, []);

  useEffect(() => {
    if (!name) return;
    const timer = window.setTimeout(() => setName(null), 5000);
    return () => window.clearTimeout(timer);
  }, [name]);

  if (!name) return null;

  return (
    <div role="status" className="fixed inset-x-4 bottom-6 z-[60] mx-auto flex max-w-sm items-center gap-3 rounded-xl border border-brand/40 bg-surface px-4 py-3 shadow-card">
      <PartyPopper className="size-5 shrink-0 text-brand" aria-hidden />
      <p className="flex-1 text-sm font-medium">{t("welcome", { name })}</p>
      <button type="button" onClick={() => setName(null)} aria-label={t("close")} className="text-muted hover:text-foreground">
        <X className="size-4" />
      </button>
    </div>
  );
}
