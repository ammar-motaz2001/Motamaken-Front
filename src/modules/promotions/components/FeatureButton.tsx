"use client";

import { useState, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
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

export function FeatureButton({ kind, user, currency, className, children }: FeatureButtonProps) {
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <Link href="/login?next=/" className={className}>
        {children}
      </Link>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {kind === "profile" ? (
        <FeatureProfileModal open={open} onClose={() => setOpen(false)} user={user} currency={currency} />
      ) : (
        <FeatureProjectModal open={open} onClose={() => setOpen(false)} currency={currency} />
      )}
    </>
  );
}
