"use client";

import { Menu as MenuIcon, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Link, usePathname } from "@/i18n/navigation";
import type { Currency } from "@/lib/api/types";
import { AccountLinks } from "./AccountLinks";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { NAV_ITEMS } from "./nav";
import { ThemeToggle } from "./ThemeToggle";

type MobileMenuProps = {
  signedIn: boolean;
  currencies: Currency[];
  currency: string;
};

/** Slide-in menu for small screens; closes on Escape or when the page changes and locks scrolling while open. */
export function MobileMenu({ signedIn, currencies, currency }: MobileMenuProps) {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setOpenOn(null);
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const closeOnLink = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("a")) setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        aria-label={t("openMenu")}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex size-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-surface-muted sm:size-9 lg:hidden"
      >
        {/* The design's side-menu button (three lines); the orange grid next to it opens Our Services. */}
        <MenuIcon className="size-6" aria-hidden />
      </button>

      {open &&
        createPortal(
          <div className="fade-in fixed inset-0 z-50 bg-overlay backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)}>
            <div
              role="dialog"
              aria-modal="true"
              aria-label={t("menu")}
              onClick={(event) => {
                event.stopPropagation();
                closeOnLink(event);
              }}
              className="drawer-in absolute inset-y-0 start-0 flex w-[min(320px,85vw)] flex-col gap-6 overflow-y-auto bg-surface p-4 shadow-card"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-brand">{t("menu")}</span>
                <button
                  type="button"
                  aria-label={t("closeMenu")}
                  onClick={() => setOpen(false)}
                  className="flex size-9 items-center justify-center rounded-md hover:bg-surface-muted"
                >
                  <X className="size-5" />
                </button>
              </div>

              <nav aria-label={t("mainNav")}>
                <ul className="flex flex-col">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.key} className="border-b border-border last:border-b-0">
                      <Link href={item.href} className="flex py-3 text-base font-bold hover:text-brand">
                        {t(`nav.${item.key}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="border-t border-border pt-4">
                <AccountLinks signedIn={signedIn} />
              </div>

              <div className="mt-auto flex items-center gap-4 border-t border-border pt-4">
                <LocaleSwitcher signedIn={signedIn} />
                <CurrencySwitcher currencies={currencies} initial={currency} signedIn={signedIn} />
                <ThemeToggle signedIn={signedIn} />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
