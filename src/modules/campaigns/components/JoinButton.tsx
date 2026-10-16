"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { CampaignPromoter } from "@/lib/api/types";
import { CopyLink } from "./CopyLink";

export function JoinButton({ campaignId }: { campaignId: number }) {
  const t = useTranslations("Campaigns.promoter");
  const router = useRouter();
  const [link, setLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const join = async () => {
    setBusy(true);
    setError(null);
    try {
      const { data } = await api<{ data: CampaignPromoter }>(`/campaigns/${campaignId}/join`, { method: "POST" });
      setLink(data.link);
      router.refresh();
    } catch (caught) {
      setError((caught as ApiError).message || null);
    } finally {
      setBusy(false);
    }
  };

  if (link) return <CopyLink link={link} />;

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="solid" font="button" loading={busy} onClick={join}>
        {t("join")}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
