"use client";

import { Heart, Home, LayoutGrid, Plus, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

/**
 * Phone tab bar from the mobile design: Home, Categories, a raised "+" to post a project, Favorites and the account,
 * fixed to the bottom of the screen (hidden from tablets up). Guests reach sign-in from the account tab.
 */
export function BottomNav({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations("Header.tabs");
  const pathname = usePathname();
  const tabs = [
    { key: "home", href: "/", Icon: Home },
    { key: "categories", href: "/categories", Icon: LayoutGrid },
    { key: "favorites", href: "/favorites", Icon: Heart },
    { key: "account", href: signedIn ? "/profile" : "/login", Icon: User },
  ] as const;
  // The admin panel has its own menu.
  if (pathname.startsWith("/admin")) return null;
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const tab = ({ key, href, Icon }: (typeof tabs)[number]) => (
    <Link key={key} href={href} aria-current={active(href) ? "page" : undefined} className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${active(href) ? "text-brand" : "text-muted"}`}>
      <Icon className="size-5" aria-hidden />
      {t(key)}
    </Link>
  );

  return (
    <nav data-bottom-nav aria-label={t("label")} className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(0,0,0,0.06)] md:hidden">
      <div className="flex items-end">
        {tabs.slice(0, 2).map(tab)}
        <Link href="/projects/new" aria-label={t("post")} className="-mt-5 flex flex-1 justify-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-gradient-brand text-white shadow-card">
            <Plus className="size-6" aria-hidden />
          </span>
        </Link>
        {tabs.slice(2).map(tab)}
      </div>
    </nav>
  );
}
