"use client";

import { MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { Conversation } from "@/lib/api/types";

export function MessageUserButton({ userId, projectId, label }: { userId: number; projectId?: number; label?: string }) {
  const t = useTranslations("Projects");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const open = () =>
    startTransition(async () => {
      const result = await api<{ data: Conversation }>("/conversations", { method: "POST", body: { userId, projectId } }).catch(
        () => null,
      );
      router.push(result ? `/messages?c=${result.data.id}` : "/messages");
    });

  return (
    <button
      type="button"
      onClick={open}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-full border border-brand px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand-soft disabled:opacity-60"
    >
      <MessageSquare className="size-4" />
      {label ?? t("detail.message")}
    </button>
  );
}
