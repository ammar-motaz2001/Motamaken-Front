"use client";

import Image from "next/image";
import GB from "country-flag-icons/react/3x2/GB";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

function Flag({ locale }: { locale: Locale }) {
  return locale === "ar" ? (
    <Image src="/images/flag-sa.svg" alt="" width={22} height={16} />
  ) : (
    <GB className="h-4 w-[22px] rounded-[2px]" />
  );
}

export function LocaleSwitcher() {
  const t = useTranslations("Header.languages");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <Dropdown
      label="Language"
      selected={locale}
      onSelect={(next) =>
        startTransition(() => router.replace(`${pathname}${window.location.search}`, { locale: next as Locale }))
      }
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
          <span className="text-base font-medium">{t(locale)}</span>
          <Image src="/images/arrow-down-sm.svg" alt="" width={12} height={12} className="dark:invert" />
        </>
      }
    />
  );
}
