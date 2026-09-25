"use client";

import { PartyPopper } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

const WELCOME_POINTS = 50;

export function WelcomeModal({ open, onContinue }: { open: boolean; onContinue: () => void }) {
  const t = useTranslations("Auth");

  return (
    <Modal open={open} onClose={onContinue}>
      <span className="flex size-[150px] items-center justify-center rounded-full bg-brand/10 text-brand">
        <PartyPopper size={72} strokeWidth={1.25} aria-hidden />
      </span>
      <h2 className="text-2xl font-bold text-brand">{t("welcomeTitle")}</h2>
      <p className="max-w-[530px] text-lg leading-snug">{t("welcomeMessage", { points: WELCOME_POINTS })}</p>
      <Button font="button" width="100%" className="max-w-[764px]" onClick={onContinue}>
        {t("goToLogin")}
      </Button>
    </Modal>
  );
}
