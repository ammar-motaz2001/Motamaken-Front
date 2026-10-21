"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { buttonClasses } from "@/components/ui/Button";

/** Promoter's tracking link with a copy button that confirms for two seconds. */
export function CopyLink({ link }: { link: string }) {
  const t = useTranslations("Campaigns.promoter");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(link).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-2">
      <input readOnly value={link} dir="ltr" aria-label={t("yourLink")} onFocus={(event) => event.target.select()} className="h-10 min-w-0 flex-1 rounded-md border border-border bg-surface-muted px-3 text-sm" />
      <button type="button" onClick={copy} className={`${buttonClasses({ size: "sm" })} shrink-0`}>
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? t("copied") : t("copy")}
      </button>
    </div>
  );
}
