"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextArea } from "@/components/ui/TextArea";
import { useAuthGate } from "@/components/providers/AuthGateProvider";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { Conversation } from "@/lib/api/types";
import { useDraft } from "@/lib/draft";

type StartChatProps = {
  userId: number;
  projectId?: number;
  /** Renders the button; call `start` from its onClick. */
  children: (start: () => void, pending: boolean) => ReactNode;
};

/**
 * Hire / Message buttons. Signed in: opens the conversation straight away. Guest: lets them write the first message,
 * and asks for an email or phone only when they press Send; the message is then delivered as written.
 */
export function StartChat({ userId, projectId, children }: StartChatProps) {
  const t = useTranslations("StartChat");
  const router = useRouter();
  const { signedIn, requireAuth } = useAuthGate();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [body, setBody, clearDraft] = useDraft(`chat-${userId}-${projectId ?? 0}`, "");
  const [error, setError] = useState<string | null>(null);

  const openConversation = () =>
    startTransition(async () => {
      const result = await api<{ data: Conversation }>("/conversations", { method: "POST", body: { userId, projectId } }).catch(() => null);
      router.push(result ? `/messages?c=${result.data.id}` : "/messages");
    });

  const start = () => (signedIn ? openConversation() : setOpen(true));

  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!body.trim()) {
      setError(t("empty"));
      return;
    }
    // Asked before the transition: React holds back updates made inside one, so the sign-up window could never open.
    if (!(await requireAuth(t("signUpReason")))) return;
    startTransition(async () => {
      try {
        const { data } = await api<{ data: Conversation }>("/conversations", { method: "POST", body: { userId, projectId } });
        await api(`/conversations/${data.id}/messages`, { method: "POST", body: { type: "text", body: body.trim() } });
        clearDraft();
        setOpen(false);
        router.push(`/messages?c=${data.id}`);
      } catch (caught) {
        setError((caught as ApiError).message || t("failed"));
      }
    });
  };

  return (
    <>
      {children(start, pending)}
      <Modal open={open} onClose={() => !pending && setOpen(false)} showClose title={t("title")}>
        <form onSubmit={send} noValidate className="flex w-full flex-col gap-4 text-start">
          <TextArea
            label={t("message")}
            required
            rows={5}
            maxLength={5000}
            autoFocus
            placeholder={t("placeholder")}
            value={body}
            error={error ?? undefined}
            onChange={(event) => (setBody(event.target.value), setError(null))}
          />
          <p className="text-xs text-muted">{t("hint")}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" font="button" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" variant="solid" font="button" loading={pending}>
              {t("send")}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
