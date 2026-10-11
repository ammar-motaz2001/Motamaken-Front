"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";

const TYPES = ["deposit", "withdrawal_request", "escrow_fund", "escrow_release", "subscription", "promotion"] as const;

export function TypeFilter({ value }: { value: string }) {
  const t = useTranslations("Wallet.transactions");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const change = (type: string) => {
    const next = new URLSearchParams(params.toString());
    next.delete("page");
    if (type) next.set("type", type);
    else next.delete("type");
    const search = next.toString();
    router.replace(search ? `${pathname}?${search}` : pathname);
  };

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">{t("filter")}</span>
      <select value={value} onChange={(event) => change(event.target.value)} className="rounded-md border border-border bg-surface px-2.5 py-1.5">
        <option value="">{t("all")}</option>
        {TYPES.map((type) => (
          <option key={type} value={type}>
            {t(`types.${type}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
