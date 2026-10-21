"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Listbox } from "@/components/ui/Listbox";
import { useSearchParams } from "next/navigation";

const TYPES = ["deposit", "withdrawal_request", "escrow_fund", "escrow_release", "subscription", "promotion"] as const;

/** Transaction type select that rewrites `?type=` and goes back to the first page. */
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
    <div className="flex items-center gap-2 text-sm">
      <span id="wallet-type-filter" className="text-muted">
        {t("filter")}
      </span>
      <Listbox
        aria-labelledby="wallet-type-filter"
        value={value}
        onChange={change}
        options={[{ value: "", label: t("all") }, ...TYPES.map((type) => ({ value: type, label: t(`types.${type}`) }))]}
        className="w-48"
        buttonClassName="flex h-9 w-full items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-sm outline-none focus-visible:border-brand aria-expanded:border-brand"
      />
    </div>
  );
}
