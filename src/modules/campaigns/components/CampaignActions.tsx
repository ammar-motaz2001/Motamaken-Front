"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Link, useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { Campaign } from "@/lib/api/types";

/**
 * Launch / pause / resume / stop, with a confirmation for the two that move money.
 */
export function CampaignActions({ campaign }: { campaign: Campaign }) {
  const t = useTranslations("Campaigns.actions");
  const locale = useLocale();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const money = new Intl.NumberFormat(locale, { style: "currency", currency: campaign.currency }).format(campaign.budget);

  const run = async (action: "launch" | "pause" | "resume" | "cancel") => {
    if (action === "launch" && !window.confirm(t("confirmLaunch", { title: campaign.title, budget: money }))) return;
    if (action === "cancel" && !window.confirm(t("confirmCancel", { title: campaign.title }))) return;

    setBusy(action);
    setError(null);
    try {
      await api(`/campaigns/${campaign.id}/${action}`, { method: "POST" });
      router.refresh();
    } catch (caught) {
      const apiError = caught as ApiError;
      setError({ message: apiError.message || t("failed"), code: apiError.code });
    } finally {
      setBusy(null);
    }
  };

  if (campaign.status === "completed" || campaign.status === "cancelled") return null;

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        {campaign.status === "draft" && (
          <>
            <Button variant="ghost" font="button" href={`/settings/campaigns/${campaign.id}/edit`}>
              {t("edit")}
            </Button>
            <Button variant="solid" font="button" loading={busy === "launch"} onClick={() => run("launch")}>
              {t("launch")}
            </Button>
          </>
        )}
        {campaign.status === "active" && (
          <Button variant="outlineOrange" font="button" loading={busy === "pause"} onClick={() => run("pause")}>
            {t("pause")}
          </Button>
        )}
        {campaign.status === "paused" && (
          <Button variant="solid" font="button" loading={busy === "resume"} onClick={() => run("resume")}>
            {t("resume")}
          </Button>
        )}
        <Button variant="ghost" font="button" className="text-danger" loading={busy === "cancel"} onClick={() => run("cancel")}>
          {t("cancel")}
        </Button>
      </div>
      {error && (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
          {error.message}{" "}
          {error.code === "insufficient_funds" && (
            <Link href="/settings/wallet" className="font-bold underline">
              {t("addFunds")}
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
