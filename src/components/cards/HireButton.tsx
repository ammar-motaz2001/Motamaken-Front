"use client";

import { useTranslations } from "next-intl";
import { StartChat } from "@/components/chat/StartChat";
import { buttonClasses } from "@/components/ui/Button";

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
          className={`${buttonClasses({ size: "sm" })} w-full`}
        >
          {t("hireMe")}
        </button>
      )}
    </StartChat>
  );
}
