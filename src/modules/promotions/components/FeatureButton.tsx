"use client";

import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { useAuthGate } from "@/components/providers/AuthGateProvider";
import type { User } from "@/lib/api/types";
import { FeatureProfileModal } from "./FeatureProfileModal";
import { FeatureProjectModal } from "./FeatureProjectModal";

type FeatureButtonProps = {
  kind: "profile" | "project";
  user: User | null;
  currency: string;
  className: string;
  children: ReactNode;
};

/**
 * "Feature my profile / project". Featuring works on your own profile or projects, so a guest confirms an email or
 * phone in place; the window then opens as soon as the account is loaded, without leaving the page.
 */
export function FeatureButton({ kind, user, currency, className, children }: FeatureButtonProps) {
  const t = useTranslations("Promotions");
  const { requireAuth } = useAuthGate();
  const [wanted, setWanted] = useState(false);
  const open = wanted && user !== null;

  const start = async () => {
    if (await requireAuth(t(kind === "profile" ? "signUpReasonProfile" : "signUpReasonProject"))) setWanted(true);
  };

  return (
    <>
      <button type="button" onClick={start} className={className}>
        {children}
      </button>
      {user &&
        (kind === "profile" ? (
          <FeatureProfileModal open={open} onClose={() => setWanted(false)} user={user} currency={currency} />
        ) : (
          <FeatureProjectModal open={open} onClose={() => setWanted(false)} currency={currency} />
        ))}
    </>
  );
}
