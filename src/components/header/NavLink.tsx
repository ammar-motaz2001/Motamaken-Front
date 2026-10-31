"use client";

import type { ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";

/** A main-menu link underlined while its page (or a page under it) is open, as in the design. */
export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative flex h-[35px] items-center gap-2 px-4 py-2.5 text-base font-bold whitespace-nowrap text-white transition-opacity hover:opacity-85 after:absolute after:inset-x-3 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-white after:transition-transform ${
        active ? "after:scale-x-100" : "after:scale-x-0"
      }`}
    >
      {children}
    </Link>
  );
}
