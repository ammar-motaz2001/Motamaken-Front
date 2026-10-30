"use client";

import Image from "next/image";
import GB from "country-flag-icons/react/3x2/GB";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { switchLocaleSmoothly } from "@/lib/localeTransition";
import { savePreference } from "./preferences";

/** Flag shown next to a language: Saudi for Arabic, British for English. */
function Flag({ locale }: { locale: Locale }) {
  return locale === "ar" ? (
    <Image src="/images/flag-sa.svg" alt="" width={22} height={16} />
  ) : (
    <GB className="h-4 w-[22px] rounded-[2px]" />
  );
}

/** Language menu: under a soft cover (see switchLocaleSmoothly), reloads the same page in the chosen language and saves the choice to the account when signed in. */
export function LocaleSwitcher({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations("Header.languages");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <Dropdown
      label="Language"
      selected={locale}
      onSelect={(next) => {
        savePreference(signedIn, { locale: next });
        const target = `${pathname}${window.location.search}`;
        switchLocaleSmoothly(next as Locale, () => startTransition(() => router.replace(target, { locale: next as Locale })));
      }}
      items={routing.locales.map((item) => ({
        value: item,
        label: (
          <>
            <Flag locale={item} />
            {t(item)}
          </>
        ),
      }))}
      trigger={
        <>
          <Flag locale={locale} />
          <span className="trim-text text-base font-medium">{t(locale)}</span>
          <Image src="/images/arrow-down-sm.svg" alt="" width={12} height={12} className="dark:invert" />
        </>
      }
    />
  );
}
