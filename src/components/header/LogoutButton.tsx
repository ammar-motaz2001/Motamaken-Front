"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { deleteSession } from "@/modules/auth/actions";

export function LogoutButton() {
  const t = useTranslations("Header");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await deleteSession();
          router.replace("/login");
        })
      }
      className="text-base font-bold text-danger hover:opacity-85 disabled:opacity-50"
    >
      {t("logout")}
    </button>
  );
}
