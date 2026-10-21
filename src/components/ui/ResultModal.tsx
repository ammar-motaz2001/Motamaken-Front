"use client";

import type { ReactNode } from "react";
import { Modal } from "./Modal";
import { StatusIcon } from "./StatusIcon";

type ResultModalProps = {
  open: boolean;
  onClose: () => void;
  type: "success" | "error" | "warning";
  title?: ReactNode;
  message: ReactNode;
  children?: ReactNode;
};

/** Dialog that reports an outcome (success, error or warning) with a message and optional buttons. */
export function ResultModal({ open, onClose, type, title, message, children }: ResultModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} showClose>
      {type === "warning" ? (
        <span aria-hidden className="flex size-12 items-center justify-center rounded-full bg-danger text-2xl font-bold text-white">
          !
        </span>
      ) : (
        <StatusIcon type={type} size={type === "success" ? 72 : 48} />
      )}
      <div className="text-base leading-snug font-bold">{message}</div>
      {children && <div className="flex flex-wrap justify-center gap-3">{children}</div>}
    </Modal>
  );
}
