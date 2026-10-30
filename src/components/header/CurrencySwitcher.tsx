"use client";

import Image from "next/image";
import { useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import { useRouter } from "@/i18n/navigation";
import type { Currency } from "@/lib/api/types";
import { CURRENCY_COOKIE } from "@/lib/currency";
import { savePreference } from "./preferences";

const FALLBACK: Currency[] = [{ code: "USD", symbol: "$", name: "US Dollar" }];

type CurrencySwitcherProps = {
  currencies: Currency[];
  initial?: string;
  signedIn: boolean;
};

/** Currency menu: remembers the choice (cookie, and the account when signed in) and re-renders every price in it. */
export function CurrencySwitcher({ currencies, initial = "USD", signedIn }: CurrencySwitcherProps) {
  const router = useRouter();
  const [currency, setCurrency] = useState(initial);
  const options = currencies.length ? currencies : FALLBACK;

  const select = async (value: string) => {
    setCurrency(value);
    // Everyone (guests too) keeps the choice in a cookie; accounts also save it. Then every price re-renders in it.
    document.cookie = `${CURRENCY_COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    await savePreference(signedIn, { currency: value });
    router.refresh();
  };

  return (
    <Dropdown
      label="Currency"
      selected={currency}
      onSelect={select}
      items={options.map((item) => ({ value: item.code, label: item.code }))}
      trigger={
        <>
          <span className="trim-text text-base font-medium">{currency}</span>
          <Image src="/images/arrow-down-sm.svg" alt="" width={12} height={12} className="dark:invert" />
        </>
      }
    />
  );
}
