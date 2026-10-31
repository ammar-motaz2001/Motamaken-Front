"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState, type ReactNode } from "react";

/** On phones, content folded behind a button (e.g. list filters, so results come first); always open from tablets up. */
export function MobileCollapse({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 items-center justify-center gap-2 self-start rounded-md border border-border bg-surface px-4 text-sm font-semibold md:hidden"
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        {label}
      </button>
      <div className={`${open ? "" : "hidden"} md:block`}>{children}</div>
    </div>
  );
}
