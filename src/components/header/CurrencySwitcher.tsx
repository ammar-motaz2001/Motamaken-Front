"use client";

import Image from "next/image";
import { useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import { useRouter } from "@/i18n/navigation";
import type { Currency } from "@/lib/api/types";
import { savePreference } from "./preferences";

const FALLBACK: Currency[] = [{ code: "USD", symbol: "$", name: "US Dollar" }];

type CurrencySwitcherProps = {
  currencies: Currency[];
  initial?: string;
  signedIn: boolean;
};

export function CurrencySwitcher({ currencies, initial = "USD", signedIn }: CurrencySwitcherProps) {
  const router = useRouter();
  const [currency, setCurrency] = useState(initial);
  const options = currencies.length ? currencies : FALLBACK;

  const select = async (value: string) => {
    setCurrency(value);
    await savePreference(signedIn, { currency: value });
    if (signedIn) router.refresh();
  };

  return (
    <Dropdown
      label="Currency"
      selected={currency}
      onSelect={select}
      items={options.map((item) => ({ value: item.code, label: item.code }))}
      trigger={
        <>
          <span className="text-base font-medium">{currency}</span>
          <Image src="/images/arrow-down-sm.svg" alt="" width={12} height={12} className="dark:invert" />
        </>
      }
    />
  );
}
