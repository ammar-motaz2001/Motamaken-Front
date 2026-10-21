"use client";

import { Check, Copy, Mail, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FaFacebookF, FaWhatsapp, FaXTwitter } from "react-icons/fa6";

/** Referral link and code with copy buttons and share links (WhatsApp, X, Facebook) carrying a ready-made message. */
export function ShareLink({ link, code }: { link: string; code: string }) {
  const t = useTranslations("Rewards.invite");
  const [copied, setCopied] = useState<"link" | "code" | null>(null);
  const message = encodeURIComponent(t("shareMessage", { link }));

  const copy = async (value: string, what: "link" | "code") => {
    await navigator.clipboard.writeText(value).catch(() => undefined);
    setCopied(what);
    setTimeout(() => setCopied(null), 2000);
  };

  const shares = [
    { name: "WhatsApp", href: `https://wa.me/?text=${message}`, Icon: FaWhatsapp },
    { name: "X", href: `https://x.com/intent/post?text=${message}`, Icon: FaXTwitter },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, Icon: FaFacebookF },
    { name: "Telegram", href: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(t("shareTitle"))}`, Icon: Send },
    { name: t("email"), href: `mailto:?subject=${encodeURIComponent(t("shareTitle"))}&body=${message}`, Icon: Mail },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input readOnly value={link} dir="ltr" aria-label={t("yourLink")} onFocus={(event) => event.target.select()} className="h-11 min-w-0 flex-1 rounded-md border border-border bg-surface-muted px-3 text-sm" />
        <button type="button" onClick={() => copy(link, "link")} className="flex shrink-0 items-center gap-1.5 rounded-md bg-gradient-brand px-4 text-sm font-medium text-white hover:opacity-90">
          {copied === "link" ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied === "link" ? t("copied") : t("copy")}
        </button>
      </div>
      <p className="text-sm">
        {t("yourCode")}{" "}
        <button type="button" onClick={() => copy(code, "code")} className="rounded border border-dashed border-brand px-2 py-0.5 font-mono font-bold text-brand" dir="ltr">
          {code}
        </button>
        {copied === "code" && <span className="ms-2 text-xs text-brand">{t("copied")}</span>}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">{t("shareOn")}</span>
        {shares.map(({ name, href, Icon }) => (
          <a key={name} href={href} target="_blank" rel="noreferrer noopener" aria-label={name} className="flex size-9 items-center justify-center rounded-full border border-border hover:border-brand hover:text-brand">
            <Icon className="size-4" />
          </a>
        ))}
      </div>
    </div>
  );
}
