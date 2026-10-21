"use client";

import { MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { StartChat } from "@/components/chat/StartChat";

/** "Send message" button that opens (or creates) a conversation with the user, tied to a project when given. */
export function MessageUserButton({ userId, projectId, label }: { userId: number; projectId?: number; label?: string }) {
  const t = useTranslations("Projects");

  return (
    <StartChat userId={userId} projectId={projectId}>
      {(start, pending) => (
        <button
          type="button"
          onClick={start}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand-soft disabled:opacity-60"
        >
          <MessageSquare className="size-4" />
          {label ?? t("detail.message")}
        </button>
      )}
    </StartChat>
  );
}
