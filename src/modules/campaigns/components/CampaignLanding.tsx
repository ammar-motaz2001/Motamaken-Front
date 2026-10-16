"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";

/**
 * The page behind a promoter's link: reports the visit from the visitor's own browser, then shows the campaign's target.
 */
export function CampaignLanding({ code }: { code: string }) {
  const t = useTranslations("Campaigns.landing");
  const router = useRouter();
  const [invalid, setInvalid] = useState(false);
  const reported = useRef(false);

  useEffect(() => {
    // Development mode runs effects twice; a visit is reported once.
    if (reported.current) return;
    reported.current = true;

    api<{ recorded: boolean; valid: boolean; path: string | null }>("/campaign-visits", {
      method: "POST",
      body: { code, referrer: document.referrer || null },
    })
      .then(({ path }) => (path ? router.replace(path) : setInvalid(true)))
      .catch(() => setInvalid(true));
  }, [code, router]);

  return (
    <div className="page-container flex min-h-[50vh] flex-col items-center justify-center gap-4 py-16 text-center">
      {invalid ? (
        <>
          <p className="text-lg font-bold">{t("invalid")}</p>
          <Button variant="solid" font="button" href="/">
            {t("home")}
          </Button>
        </>
      ) : (
        <>
          <span className="size-8 animate-spin rounded-full border-4 border-brand/30 border-t-brand" role="status" aria-label={t("loading")} />
          <p className="text-muted">{t("loading")}</p>
        </>
      )}
    </div>
  );
}
