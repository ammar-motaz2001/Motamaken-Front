"use client";

import { BellOff, CheckCheck } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { panelClasses } from "@/components/ui/styles";
import { Switch } from "@/components/ui/Switch";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Link, useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { AppNotification, Paginated } from "@/lib/api/types";
import { Badge } from "@/components/ui/Badge";
import { NOTIFICATION_GROUPS, notificationHref, type NotificationGroup } from "@/lib/notifications";

type Result = Paginated<AppNotification> & { unreadByGroup: Record<NotificationGroup, number> };

/**
 * Notifications in group tabs with an unread-only switch, paged from GET /notifications; opening one marks it
 * read and goes to its page.
 */
export function NotificationsPage() {
  const t = useTranslations("Notifications");
  const format = useFormatter();
  const router = useRouter();
  const [group, setGroup] = useState<NotificationGroup | "all">("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [meta, setMeta] = useState<Result["meta"] | null>(null);
  const [counts, setCounts] = useState<Partial<Record<NotificationGroup, number>>>({});
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const [version, setVersion] = useState(0);
  const key = `${group}|${unreadOnly}|${version}`;
  const loading = loadedKey !== key || loadingMore;

  const url = useCallback(
    (page: number) => `/notifications?${new URLSearchParams({ page: String(page), perPage: "20", ...(group !== "all" && { group }), ...(unreadOnly && { unread: "1" }) })}`,
    [group, unreadOnly],
  );

  useEffect(() => {
    let cancelled = false;
    api<Result>(url(1))
      .then((result) => {
        if (cancelled) return;
        setItems(result.data);
        setMeta(result.meta);
        setCounts(result.unreadByGroup);
        setFailed(false);
        setLoadedKey(key);
      })
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
        setLoadedKey(key);
      });
    return () => {
      cancelled = true;
    };
  }, [url, key]);

  const loadMore = async (page: number) => {
    setLoadingMore(true);
    const result = await api<Result>(url(page)).catch(() => null);
    if (result) {
      setItems((current) => [...current, ...result.data]);
      setMeta(result.meta);
    }
    setLoadingMore(false);
  };

  const open = async (item: AppNotification) => {
    if (!item.readAt) {
      await api(`/notifications/${item.id}/read`, { method: "POST" }).catch(() => undefined);
      setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, readAt: new Date().toISOString() } : entry)));
      router.refresh();
    }
    const href = notificationHref(item);
    if (href) router.push(href);
  };

  const readAll = async () => {
    await api("/notifications/read-all", { method: "POST" }).catch(() => undefined);
    router.refresh();
    setVersion((value) => value + 1);
  };

  const totalUnread = Object.values(counts).reduce((sum, value) => sum + (value ?? 0), 0);

  return (
    <section className={`${panelClasses} flex flex-col gap-5`}>
      <PageHeader
        crumbs={[{ label: t("home"), href: "/" }, { label: t("title") }]}
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={unreadOnly} label={t("unreadOnly")} onChange={setUnreadOnly} />
              {t("unreadOnly")}
            </label>
            <button type="button" onClick={readAll} disabled={!totalUnread} className="flex items-center gap-1.5 text-sm font-medium text-brand hover:underline disabled:opacity-40">
              <CheckCheck className="size-4" />
              {t("markAllRead")}
            </button>
          </div>
        }
      />

      <nav className="flex gap-1 overflow-x-auto rounded-lg bg-surface-muted p-1 [scrollbar-width:none]" aria-label={t("groups.label")}>
        {(["all", ...NOTIFICATION_GROUPS] as const).map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={group === name}
            onClick={() => setGroup(name)}
            className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${group === name ? "bg-surface font-bold shadow-card" : "text-muted hover:text-foreground"}`}
          >
            {t(`groups.${name}`)}
            {name !== "all" && <Badge inline count={counts[name] ?? 0} />}
          </button>
        ))}
      </nav>

      {failed && <p className="py-8 text-center text-sm text-muted">{t("failed")}</p>}
      {!failed && !loading && !items.length && (
        <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted">
          <BellOff className="size-12 text-placeholder" strokeWidth={1.2} aria-hidden />
          {t(unreadOnly ? "emptyUnread" : "empty")}
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {items.map((item) => {
          const href = notificationHref(item);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => open(item)}
                className={`flex w-full items-start gap-3 rounded-lg border p-3 text-start transition-colors ${
                  item.readAt ? "border-border bg-surface hover:bg-surface-muted" : "border-brand/40 bg-brand-soft hover:bg-brand-soft/70"
                } ${href ? "cursor-pointer" : "cursor-default"}`}
              >
                <UserAvatar name={item.user?.fullName ?? "Mutamakin"} src={item.user?.avatarUrl ?? null} size={40} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm">{item.title && <strong className="block">{item.title}</strong>}
{item.message}</span>
                  <span className="text-xs text-muted">{format.dateTime(new Date(item.createdAt), { dateStyle: "medium", timeStyle: "short" })}</span>
                </span>
                {!item.readAt && <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-brand" aria-label={t("unread")} />}
              </button>
            </li>
          );
        })}
      </ul>

      {loading && <p className="text-center text-sm text-muted">{t("loading")}</p>}
      {!loading && meta && meta.current_page < meta.last_page && (
        <button type="button" onClick={() => loadMore(meta.current_page + 1)} className="self-center rounded-full border border-border px-6 py-2 text-sm hover:border-brand">
          {t("loadMore")}
        </button>
      )}

      <p className="text-center text-xs text-muted">
        {t.rich("settingsHint", { link: (chunks) => <Link href="/settings/notifications" className="font-bold text-brand hover:underline">{chunks}</Link> })}
      </p>
    </section>
  );
}
