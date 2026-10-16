"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export function ProcessingScreen() {
  const t = useTranslations("Wallet");

  return (
    <div role="status" className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-5 bg-surface p-6 text-center">
      <Image src="/images/logo.png" alt="Mutamakin" width={181} height={48} className="h-auto w-[150px]" />
      <div className="flex flex-col gap-2" aria-hidden>
        <span className="flex items-center gap-2">
          <span className="size-5 animate-pulse rounded bg-brand/50" />
          <span className="h-2 w-16 animate-pulse rounded bg-brand/50" />
        </span>
        <span className="flex items-center gap-2">
          <span className="size-6 animate-pulse rounded bg-brand" />
          <span className="h-2.5 w-20 animate-pulse rounded bg-brand" />
        </span>
      </div>
      <p className="text-sm">{t("processing")}</p>
    </div>
  );
}
