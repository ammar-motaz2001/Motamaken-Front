"use client";

import { useTranslations } from "next-intl";
import { LogoLoader } from "@/components/ui/LogoLoader";

/** Full-screen logo animation while a payment is being processed. */
export function ProcessingScreen() {
  const t = useTranslations("Wallet");
  return <LogoLoader variant="overlay" label={t("processing")} size={300} />;
}
