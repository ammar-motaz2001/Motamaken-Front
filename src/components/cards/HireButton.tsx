"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { Conversation } from "@/lib/api/types";

export function HireButton({ userId, signedIn }: { userId: number; signedIn: boolean }) {
  const t = useTranslations("Home");
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const hire = () => {
    if (!signedIn) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    startTransition(async () => {
      const { data } = await api<{ data: Conversation }>("/conversations", { method: "POST", body: { userId } }).catch(
        () => ({ data: null }),
      );
      router.push(data ? `/messages?c=${data.id}` : "/messages");
    });
  };

  return (
    <button
      type="button"
      onClick={hire}
      disabled={pending}
      className="flex h-[37px] flex-1 items-center justify-center rounded-md bg-gradient-brand text-sm font-medium whitespace-nowrap text-white capitalize hover:opacity-90 disabled:opacity-60"
    >
      {t("hireMe")}
    </button>
  );
}
