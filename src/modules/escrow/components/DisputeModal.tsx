"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Select } from "@/components/ui/Select";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { Milestone } from "@/lib/api/types";
import { DISPUTE_REASONS } from "../lib/status";
import { TextModal } from "./TextModal";

export function DisputeModal({ milestone, onClose }: { milestone: Milestone | null; onClose: () => void }) {
  const t = useTranslations("Escrow.dispute");
  const router = useRouter();
  const [reason, setReason] = useState<string>(DISPUTE_REASONS[0]);

  return (
    <TextModal
      open={Boolean(milestone)}
      onClose={onClose}
      title={t("title", { milestone: milestone?.title ?? "" })}
      label={t("description")}
      placeholder={t("placeholder")}
      submitLabel={t("submit")}
      cancelLabel={t("cancel")}
      required
      minLength={20}
      onSubmit={async (description) => {
        try {
          const { data } = await api<{ data: { id: number } }>(`/milestones/${milestone?.id}/dispute`, { method: "POST", body: { reason, description } });
          router.push(`/disputes/${data.id}`);
          return null;
        } catch (caught) {
          const apiError = caught as ApiError;
          return apiError.fields.description ?? apiError.message ?? t("failed");
        }
      }}
    >
      <p className="rounded-lg bg-orange/10 p-3 text-sm text-orange">{t("warning")}</p>
      <Select label={t("reason")} value={reason} options={DISPUTE_REASONS.map((value) => ({ value, label: t(`reasons.${value}`) }))} onChange={(event) => setReason(event.target.value)} />
    </TextModal>
  );
}
