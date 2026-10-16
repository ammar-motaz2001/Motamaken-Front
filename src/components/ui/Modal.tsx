"use client";

import { useTranslations } from "next-intl";
import { useEffect, type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  showClose?: boolean;
  children: ReactNode;
};

const openModals: symbol[] = [];

export function Modal({ open, onClose, title, showClose, children }: ModalProps) {
  const t = useTranslations("Auth");

  useEffect(() => {
    if (!open) return;
    // Windows can open on top of each other (e.g. the privacy policy over a payment): Escape closes the top one only,
    // and the page stays locked until the last one closes.
    const id = Symbol("modal");
    openModals.push(id);
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && openModals.at(-1) === id && onClose();
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      openModals.splice(openModals.indexOf(id), 1);
      if (!openModals.length) document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-[796px] flex-col gap-9 rounded-xl bg-surface px-4 pt-4 pb-6 shadow-card"
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between gap-1.5 px-3.5">
            <div className="flex items-center gap-1.5 text-xl leading-[21px] font-bold text-heading">{title}</div>
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label={t("close")}
                className="flex size-5 items-center justify-center rounded-full border-[1.5px] border-foreground text-base leading-none"
              >
                ×
              </button>
            )}
          </div>
        )}
        <div className="flex flex-col items-center gap-4 px-2 text-center sm:px-[30px]">{children}</div>
      </div>
    </div>
  );
}
