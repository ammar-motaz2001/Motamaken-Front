"use client";

import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextArea } from "@/components/ui/TextArea";
import { SHARE_STEP } from "../lib/data";
import { formatMoney, shareAmount } from "../lib/format";
import { ShareStepper } from "./ShareStepper";
import { softSuccessClasses, softWarningClasses } from "./styles";

type NegotiateModalProps = {
  open: boolean;
  offered: number;
  otherShares: number;
  total: number;
  onClose: () => void;
  onSubmit: (proposal: { share: number; reason: string }) => void;
};

export function NegotiateModal({ open, offered, otherShares, total, onClose, onSubmit }: NegotiateModalProps) {
  const t = useTranslations("Projects.negotiate");
  const ta = useTranslations("Projects.actions");
  const [share, setShare] = useState(offered + SHARE_STEP);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string>();
  const newTotal = otherShares + share;
  const overflow = Math.max(0, newTotal - 100);

  const submit = () => {
    if (!reason.trim()) {
      setError(t("reasonRequired"));
      return;
    }
    onSubmit({ share, reason: reason.trim() });
  };

  return (
    <Modal open={open} onClose={onClose} title={t("title")} showClose>
      <div className="flex w-full flex-col gap-4 text-start">
        <p className="text-sm text-muted">{t("subtitle")}</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center gap-1 rounded-lg bg-surface-muted p-4">
            <span className="text-xs text-muted">{t("offered")}</span>
            <span className="text-4xl font-bold text-muted">{offered}%</span>
            <span dir="ltr" className="text-xs text-muted">
              {formatMoney(shareAmount(total, offered))}
            </span>
          </div>
          <div className={`${softSuccessClasses} flex flex-col items-center gap-1 border-brand p-4`}>
            <span className="text-xs text-muted">{t("proposal")}</span>
            <ShareStepper label={t("proposal")} value={share} onChange={setShare} step={1} min={1} max={100} size="lg" />
            <span dir="ltr" className="text-xs font-bold text-brand">
              {formatMoney(shareAmount(total, share))}
            </span>
          </div>
        </div>

        <dl className={`${softWarningClasses} grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 p-4 text-sm`}>
          <p className="col-span-2 font-bold text-orange">{t("impact")}</p>
          <dt className="text-muted">{t("total")}</dt>
          <dd className={`font-bold ${overflow ? "text-danger" : "text-brand"}`}>
            {t(overflow ? "exceeds" : "fits", { total: newTotal })}
          </dd>
          <dt className="text-muted">{t("reduce")}</dt>
          <dd className="font-bold text-orange">{overflow}%</dd>
          <dt className="text-muted">{t("approvers")}</dt>
          <dd className="font-bold">{t("approversValue")}</dd>
        </dl>

        <TextArea
          label={t("reason")}
          placeholder={t("reasonPlaceholder")}
          rows={2}
          value={reason}
          error={error}
          onChange={(event) => {
            setReason(event.target.value);
            setError(undefined);
          }}
        />

        <p className={`${softSuccessClasses} flex items-start gap-2 p-3 text-xs`}>
          <Info size={14} className="mt-0.5 shrink-0 text-brand" aria-hidden />
          {t("note")}
        </p>

        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" pill onClick={onClose}>
            {ta("back")}
          </Button>
          <Button variant="solid" pill onClick={submit}>
            {t("send")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
