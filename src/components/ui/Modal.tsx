"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  showClose?: boolean;
  children: ReactNode;
};

const openModals: symbol[] = [];

/** Centred dialog over a dimmed page; Escape closes only the top one and the page stays locked until the last closes. */
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

  // Rendered straight into <body>: a parent with a transform or animation can then never move it off the screen's centre.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-[796px] flex-col gap-9 rounded-xl glass border border-border px-4 pt-4 pb-6 shadow-card"
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between gap-1.5 px-3.5">
            <div className="flex items-center gap-1.5 text-xl leading-[21px] font-bold text-heading">{title}</div>
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label={t("close")}
                className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-foreground hover:bg-surface-muted"
              >
                <X className="size-4" strokeWidth={2.25} aria-hidden />
              </button>
            )}
          </div>
        )}
        <div className="flex flex-col items-center gap-4 px-2 text-center sm:px-[30px]">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
