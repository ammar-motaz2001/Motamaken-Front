"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Link } from "@/i18n/navigation";
import { StatusIcon } from "@/components/ui/StatusIcon";

type ErrorModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
};

export function ErrorModal({ open, onClose, title, message }: ErrorModalProps) {
  const t = useTranslations("Auth");

  return (
    <Modal open={open} onClose={onClose} title={t("error")} showClose>
      <StatusIcon type="error" size={48} />
      <div className="text-base leading-snug">
        <p className="font-bold">{title}</p>
        <p>{message}</p>
      </div>
      <Link href="/contact" className="border-b border-placeholder text-base font-bold text-placeholder">
        {t("needHelp")}
      </Link>
      <Button variant="outlineOrange" font="button" width={110} onClick={onClose}>
        {t("close")}
      </Button>
    </Modal>
  );
}
