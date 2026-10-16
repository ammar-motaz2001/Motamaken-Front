"use client";

import { useTranslations } from "next-intl";
import { StartChat } from "@/components/chat/StartChat";

/** `signedIn` is no longer needed: guests write their first message and sign up when sending it. */
export function HireButton({ userId }: { userId: number; signedIn?: boolean }) {
  const t = useTranslations("Home");

  return (
    <StartChat userId={userId}>
      {(start, pending) => (
        <button
          type="button"
          onClick={start}
          disabled={pending}
          className="flex h-[37px] flex-1 items-center justify-center rounded-md bg-gradient-brand text-sm font-medium whitespace-nowrap text-white capitalize hover:opacity-90 disabled:opacity-60"
        >
          {t("hireMe")}
        </button>
      )}
    </StartChat>
  );
}
