"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useDismiss } from "@/components/ui/useDismiss";
import { Link, useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { AppNotification, Paginated } from "@/lib/api/types";
import { timeAgo } from "@/lib/format";
import { notificationHref } from "@/lib/notifications";
import { usePresence } from "@/components/ui/usePresence";


/** Bell menu: loads the latest alerts from GET /notifications when opened, marks one or all read, links to the full list. */
export function NotificationsMenu({ unread }: { unread: number }) {
  const t = useTranslations("Header");
  const locale = useLocale();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const menu = usePresence(open);
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [failed, setFailed] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, ref, close);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (!next) return;
    setFailed(false);
    try {
      setItems((await api<Paginated<AppNotification>>("/notifications")).data);
    } catch {
      setFailed(true);
    }
  };

  const openItem = async (notification: AppNotification) => {
    setOpen(false);
    if (!notification.readAt) await api(`/notifications/${notification.id}/read`, { method: "POST" }).catch(() => undefined);
    const href = notificationHref(notification);
    if (href) router.push(href);
    router.refresh();
  };

  const readAll = async () => {
    await api("/notifications/read-all", { method: "POST" }).catch(() => undefined);
    setItems((current) => current?.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })) ?? null);
    router.refresh();
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t("notification")}
        aria-expanded={open}
        onClick={toggle}
        className="relative flex items-center rounded-md px-1 py-[7.5px]"
      >
        <Image src="/images/notification-bold.svg" alt="" width={20} height={20} className="dark:invert" />
        <Badge count={unread} className="-top-1 start-3" />
      </button>

      {menu.mounted && (
        <div className={`${menu.leaving ? "pop-leave" : "pop-down"} absolute end-0 top-full z-40 mt-2 flex max-h-[400px] w-[min(442px,calc(100vw-32px))] flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card`}>
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-base font-bold">{t("notifications")}</span>
            {items?.some((item) => !item.readAt) && (
              <button type="button" onClick={readAll} className="text-sm font-medium text-brand hover:underline">
                {t("markAllRead")}
              </button>
            )}
          </div>
          <ul className="flex-1 overflow-y-auto">
            {!items && !failed && <li className="px-4 py-8 text-center text-sm text-muted">{t("loading")}</li>}
            {failed && <li className="px-4 py-8 text-center text-sm text-muted">{t("loadFailed")}</li>}
            {items?.length === 0 && <li className="px-4 py-8 text-center text-sm text-muted">{t("noNotifications")}</li>}
            {items?.map((item) => (
              <li key={item.id} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  onClick={() => openItem(item)}
                  className={`flex w-full items-start gap-3 px-4 py-2.5 text-start hover:bg-surface-muted ${item.readAt ? "" : "bg-brand-soft"}`}
                >
                  <UserAvatar name={item.user?.fullName ?? "M"} src={item.user?.avatarUrl ?? null} size={36} />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    {item.user && <span className="truncate text-sm font-bold">{item.user.fullName}</span>}
                    <span className="line-clamp-2 text-sm">{item.title && <strong className="block">{item.title}</strong>}
{item.message}</span>
                    <span className="text-xs text-muted">{timeAgo(item.createdAt, locale)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <Link href="/notifications" onClick={close} className="block border-t border-border py-2.5 text-center text-sm font-medium text-brand hover:bg-surface-muted">
            {t("allNotifications")}
          </Link>
        </div>
      )}
    </div>
  );
}
