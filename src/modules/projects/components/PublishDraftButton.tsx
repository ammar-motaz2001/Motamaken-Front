"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";

/** Puts a saved draft on the site. */
export function PublishDraftButton({ projectId }: { projectId: number }) {
  const t = useTranslations("Projects.mine");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publish = async () => {
    setBusy(true);
    setError(null);
    try {
      await api(`/projects/${projectId}/publish`, { method: "POST" });
      router.refresh();
    } catch (caught) {
      setError((caught as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button variant="solid" pill onClick={publish} loading={busy}>
        {t("publishDraft")}
      </Button>
      {error && <span className="text-danger">{error}</span>}
    </>
  );
}
