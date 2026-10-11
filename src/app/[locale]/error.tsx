"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { ErrorState } from "@/components/error/ErrorState";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const t = useTranslations("Errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState code="500" title={t("server.title")} message={t("server.message")}>
      <Button variant="solid" font="button" onClick={() => retry()}>
        {t("retry")}
      </Button>
      <Button href="/" variant="outline" font="button">
        {t("home")}
      </Button>
      {error.digest && <p className="w-full text-xs text-placeholder">{t("reference", { digest: error.digest })}</p>}
    </ErrorState>
  );
}
