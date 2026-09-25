"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Link } from "@/i18n/navigation";
import { AccountLinks } from "./AccountLinks";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { NAV_ITEMS } from "./nav";
import { ThemeToggle } from "./ThemeToggle";

export function MobileMenu({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations("Header");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
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
        className="flex size-10 items-center justify-center rounded-md bg-border lg:hidden"
      >
        <Image src="/images/menu.svg" alt="" width={20} height={20} className="dark:invert" />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)}>
            <div
              role="dialog"
              aria-modal="true"
              aria-label={t("menu")}
              onClick={(event) => {
                event.stopPropagation();
                closeOnLink(event);
              }}
              className="absolute inset-y-0 start-0 flex w-[min(320px,85vw)] flex-col gap-6 overflow-y-auto bg-surface p-4 shadow-card"
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

              <nav aria-label="Main">
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
                <LocaleSwitcher />
                <CurrencySwitcher />
                <ThemeToggle />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
