"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ResultModal } from "@/components/ui/ResultModal";
import { TextArea } from "@/components/ui/TextArea";
import { api } from "@/lib/api/client";

export type FeedbackContext = "deposit" | "withdrawal" | "promotion" | "subscription" | "payment_method" | "escrow";

type FeedbackModalProps = { open: boolean; onClose: () => void; context: FeedbackContext; referenceId?: number };

export function FeedbackModal({ open, onClose, context, referenceId }: FeedbackModalProps) {
  const t = useTranslations("Wallet.feedback");
  const [rating, setRating] = useState<"up" | "down" | null>(null);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const close = () => {
    setRating(null);
    setComment("");
    setDone(false);
    onClose();
  };

  const send = async () => {
    if (!rating) return;
    setSending(true);
    await api("/feedback", { method: "POST", body: { context, referenceId, rating, comment: comment.trim() || null } }).catch(() => undefined);
    setSending(false);
    setDone(true);
  };

  if (done) {
    return (
      <ResultModal open={open} onClose={close} type="success" message={t("thanks")}>
        <Button variant="primary" font="button" width={260} onClick={close}>
          {t("close")}
        </Button>
      </ResultModal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={close}
      showClose
      title={
        <span className="flex flex-col gap-1 text-start">
          {t("title")}
          <span className="text-sm font-normal text-muted">{t("subtitle")}</span>
        </span>
      }
    >
      <p className="font-medium">{t("question")}</p>
      <div className="flex gap-3">
        {(["up", "down"] as const).map((value) => {
          const Icon = value === "up" ? ThumbsUp : ThumbsDown;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={rating === value}
              aria-label={t(value)}
              onClick={() => setRating(value)}
              className={`flex size-10 items-center justify-center rounded-md border-2 transition-colors ${
                value === "up" ? "border-brand text-brand" : "border-danger text-danger"
              } ${rating === value ? (value === "up" ? "bg-brand-soft" : "bg-danger-soft") : ""}`}
            >
              <Icon className="size-5" />
            </button>
          );
        })}
      </div>
      {rating && (
        <TextArea
          label={t("opinion")}
          placeholder={t("opinionPlaceholder")}
          rows={4}
          maxLength={2000}
          value={comment}
          className="text-start"
          onChange={(event) => setComment(event.target.value)}
        />
      )}
      <div className="flex w-full items-center justify-between gap-3">
        <button type="button" onClick={close} className="text-sm text-muted hover:text-foreground">
          {t("skip")}
        </button>
        {rating && (
          <Button variant="primary" font="button" loading={sending} onClick={send}>
            {t("submit")}
          </Button>
        )}
      </div>
    </Modal>
  );
}
