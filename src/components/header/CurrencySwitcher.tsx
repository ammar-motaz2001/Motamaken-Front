"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";

const CURRENCIES = ["USD", "SAR", "EGP"] as const;

export function CurrencySwitcher() {
  const t = useTranslations("Header.currencies");
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>("USD");

  return (
    <Dropdown
      label="Currency"
      selected={currency}
      onSelect={(value) => setCurrency(value as (typeof CURRENCIES)[number])}
      items={CURRENCIES.map((item) => ({ value: item, label: t(item) }))}
      trigger={
        <>
          <span className="text-base font-medium">{t(currency)}</span>
          <Image src="/images/arrow-down-sm.svg" alt="" width={12} height={12} className="dark:invert" />
        </>
      }
    />
  );
}
