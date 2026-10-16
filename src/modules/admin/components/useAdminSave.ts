"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";

/** Shared save state for the admin editors: busy flag, field errors, a general error and a short "Saved" notice. */
export function useAdminSave() {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const save = async <T,>(endpoint: string, method: string, body?: Record<string, unknown>): Promise<T | null> => {
    setBusy(true);
    setError(null);
    setFields({});
    setSaved(false);
    try {
      const result = await api<T>(endpoint, { method, body });
      setSaved(true);
      router.refresh();
      return result;
    } catch (caught) {
      const apiError = caught as ApiError;
      setFields(apiError.fields ?? {});
      setError(apiError.message || t("failed"));
      return null;
    } finally {
      setBusy(false);
    }
  };

  return { busy, error, fields, saved, save };
}
