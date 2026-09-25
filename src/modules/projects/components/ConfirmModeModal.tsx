"use client";

import { CircleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { STEP_COUNT } from "../lib/data";
import type { ProjectMode } from "../types";
import { softSuccessClasses } from "./styles";

type ConfirmModeModalProps = {
  mode: ProjectMode | null;
  onConfirm: () => void;
  onCancel: () => void;
};

const ROWS = ["steps", "escrow", "chat", "members"] as const;

export function ConfirmModeModal({ mode, onConfirm, onCancel }: ConfirmModeModalProps) {
  const t = useTranslations("Projects.confirm");
  const ta = useTranslations("Projects.actions");

  return (
    <Modal open={mode !== null} onClose={onCancel} title={mode && t(`${mode}Title`)} showClose>
      {mode && (
        <div className="flex w-full flex-col gap-4 text-start">
          <p className="text-sm text-muted">{t(`${mode}Text`)}</p>
          <dl className={`${softSuccessClasses} grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 p-4 text-sm`}>
            <p className="col-span-2 mb-1 font-bold">{t("whatChanges")}</p>
            {ROWS.map((row) => (
              <div key={row} className="contents">
                <dt className="text-muted">{t(`rows.${row}`)}</dt>
                <dd className="font-medium">
                  {t(`${mode}.${row}`, { count: STEP_COUNT[mode], base: STEP_COUNT.individual })}
                </dd>
              </div>
            ))}
          </dl>
          <p className="flex items-start gap-2 rounded-lg bg-orange/10 px-3 py-2.5 text-sm text-orange">
            <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden />
            {t("warning")}
          </p>
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="ghost" pill onClick={onCancel}>
              {ta("change")}
            </Button>
            <Button variant="solid" pill onClick={onConfirm}>
              {mode === "team" ? ta("continueTeam") : ta("continue")}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
