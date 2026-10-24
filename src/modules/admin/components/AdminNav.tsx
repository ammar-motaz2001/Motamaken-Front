"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ADMIN_GROUPS } from "../lib/sections";
import { Badge } from "@/components/ui/Badge";
import type { Overview } from "../types";

/** Admin menu showing only the sections the staff member's role allows, with queue counts; a scrolling row on small screens. */
export function AdminNav({ queues, permissions }: { queues: Overview["queues"] | null; permissions: string[] }) {
  const t = useTranslations("Admin.nav");
  const pathname = usePathname();

  const groups = ADMIN_GROUPS.map((group) => ({ ...group, items: group.items.filter((item) => permissions.includes(item.can)) })).filter((group) => group.items.length);
  const items = groups.flatMap((group) => group.items);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <>
      {/* Phones and tablets: one scrollable row instead of a tall sidebar. */}
      <nav aria-label={t("label")} className="-mx-4 overflow-x-auto px-4 lg:hidden">
        <ul className="flex w-max gap-2 pb-1">
          {items.map((item) => {
            const active = isActive(item.href);
            const count = item.queue && queues ? queues[item.queue] : 0;
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap ${
                    active ? "border-orange bg-orange/10 font-medium text-orange" : "border-border bg-surface"
                  }`}
                >
                  <item.Icon className="size-4" />
                  {t(item.key)}
                  <Badge inline count={count} />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <AdminSidebar groups={groups} queues={queues} isActive={isActive} />
    </>
  );
}

/** Grouped, sticky admin sidebar for large screens, with the open section marked and a count on each queue. */
function AdminSidebar({ groups, queues, isActive }: { groups: typeof ADMIN_GROUPS; queues: Overview["queues"] | null; isActive: (href: string) => boolean }) {
  const t = useTranslations("Admin.nav");

  return (
    <nav aria-label={t("label")} className="hidden rounded-xl border border-border bg-surface p-2.5 lg:sticky lg:top-4 lg:block lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:overscroll-contain">
      {groups.map((group) => (
        <div key={group.key} className="mb-1 last:mb-0">
          {group.key !== "main" && <p className="px-2.5 pt-3 pb-1 text-xs font-semibold tracking-wide text-muted uppercase">{t(`groups.${group.key}`)}</p>}
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActive(item.href);
              const count = item.queue && queues ? queues[item.queue] : 0;
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                      active ? "bg-orange/10 font-medium text-orange" : "hover:bg-surface-muted"
                    }`}
                  >
                    <item.Icon className="size-4 shrink-0" />
                    {t(item.key)}
                    <Badge inline count={count} className="ms-auto" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <Link href="/" className="mt-2 flex items-center justify-center gap-1.5 border-t border-border py-2.5 text-sm text-muted hover:text-foreground">
        {t("backToSite")}
      </Link>
    </nav>
  );
}
