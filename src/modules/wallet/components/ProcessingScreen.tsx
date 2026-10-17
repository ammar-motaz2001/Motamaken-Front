"use client";

import { useTranslations } from "next-intl";
import { LogoLoader } from "@/components/ui/LogoLoader";

export function ProcessingScreen() {
  const t = useTranslations("Wallet");
  return <LogoLoader variant="overlay" label={t("processing")} size={200} />;
}
