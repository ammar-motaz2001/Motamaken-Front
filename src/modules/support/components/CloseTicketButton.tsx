"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";

/** "My problem is solved": closes the user's own ticket. */
export function CloseTicketButton({ ticketId }: { ticketId: number }) {
  const t = useTranslations("Support");
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const close = async () => {
    if (!window.confirm(t("confirmClose"))) return;
    setBusy(true);
    try {
      await api(`/support/${ticketId}/close`, { method: "POST" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" onClick={close} disabled={busy} className="h-8 rounded-md border border-border px-3 text-xs font-semibold hover:border-brand disabled:opacity-50">
      {t("close")}
    </button>
  );
}
