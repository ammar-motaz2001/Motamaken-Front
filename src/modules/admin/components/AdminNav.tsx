"use client";

import {
  Ban,
  BookOpenText,
  ChartNoAxesCombined,
  ChartPie,
  CircleHelp,
  Coins,
  FileSignature,
  FileWarning,
  FolderKanban,
  Gavel,
  Gift,
  HandCoins,
  History,
  IdCard,
  Inbox,
  LayoutDashboard,
  Layers,
  LifeBuoy,
  Mail,
  MapPin,
  Medal,
  Megaphone,
  MessagesSquare,
  PlugZap,
  Receipt,
  Repeat,
  Scale,
  ScrollText,
  Send,
  Settings2,
  Sparkles,
  Star,
  Tags,
  ThumbsUp,
  TrendingUp,
  UserCog,
  UserPlus,
  Users,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { Overview } from "../types";

type Queue = keyof Overview["queues"];

type NavItem = { key: string; href: string; Icon: LucideIcon; can: string; queue?: Queue };

const GROUPS: { key: string; items: NavItem[] }[] = [
  {
    key: "main",
    items: [
      { key: "overview", href: "/admin", Icon: LayoutDashboard, can: "overview" },
      { key: "analytics", href: "/admin/analytics", Icon: ChartPie, can: "overview" },
    ],
  },
  {
    key: "people",
    items: [
      { key: "users", href: "/admin/users", Icon: Users, can: "users.view" },
      { key: "kyc", href: "/admin/kyc", Icon: IdCard, can: "kyc", queue: "pendingKyc" },
      { key: "reports", href: "/admin/reports", Icon: FileWarning, can: "reports", queue: "openReports" },
      { key: "support", href: "/admin/support", Icon: LifeBuoy, can: "support", queue: "openTickets" },
      { key: "contact", href: "/admin/contact", Icon: Inbox, can: "support", queue: "newContactMessages" },
      { key: "staff", href: "/admin/staff", Icon: UserCog, can: "staff" },
    ],
  },
  {
    key: "marketplace",
    items: [
      { key: "projects", href: "/admin/projects", Icon: FolderKanban, can: "marketplace" },
      { key: "proposals", href: "/admin/proposals", Icon: Send, can: "marketplace" },
      { key: "escrows", href: "/admin/escrows", Icon: FileSignature, can: "finance.view" },
      { key: "teams", href: "/admin/teams", Icon: UsersRound, can: "marketplace" },
      { key: "reviews", href: "/admin/reviews", Icon: Star, can: "marketplace" },
      { key: "disputes", href: "/admin/disputes", Icon: Scale, can: "disputes", queue: "openDisputes" },
      { key: "appeals", href: "/admin/appeals", Icon: Gavel, can: "disputes", queue: "pendingAppeals" },
      { key: "campaigns", href: "/admin/campaigns", Icon: TrendingUp, can: "marketplace" },
    ],
  },
  {
    key: "money",
    items: [
      { key: "withdrawals", href: "/admin/withdrawals", Icon: WalletCards, can: "finance.view", queue: "pendingWithdrawals" },
      { key: "deposits", href: "/admin/deposits", Icon: HandCoins, can: "finance.view", queue: "pendingDeposits" },
      { key: "ledger", href: "/admin/ledger", Icon: ChartNoAxesCombined, can: "finance.view" },
      { key: "subscriptions", href: "/admin/subscriptions", Icon: Repeat, can: "finance.view" },
      { key: "promotions", href: "/admin/promotions", Icon: Megaphone, can: "finance.view" },
      { key: "plans", href: "/admin/plans", Icon: Sparkles, can: "finance.view" },
      { key: "settings", href: "/admin/settings", Icon: Receipt, can: "finance.view" },
    ],
  },
  {
    key: "rewards",
    items: [
      { key: "points", href: "/admin/points", Icon: Coins, can: "rewards" },
      { key: "medals", href: "/admin/medals", Icon: Medal, can: "rewards" },
      { key: "draws", href: "/admin/draws", Icon: Gift, can: "rewards" },
      { key: "affiliate", href: "/admin/affiliate", Icon: UserPlus, can: "rewards" },
    ],
  },
  {
    key: "content",
    items: [
      { key: "pages", href: "/admin/pages", Icon: BookOpenText, can: "content" },
      { key: "faqs", href: "/admin/faqs", Icon: CircleHelp, can: "content" },
      { key: "categories", href: "/admin/categories", Icon: Layers, can: "content" },
      { key: "skills", href: "/admin/skills", Icon: Tags, can: "content" },
      { key: "locations", href: "/admin/locations", Icon: MapPin, can: "content" },
    ],
  },
  {
    key: "communication",
    items: [
      { key: "broadcasts", href: "/admin/broadcasts", Icon: Megaphone, can: "notifications" },
      { key: "templates", href: "/admin/templates", Icon: ScrollText, can: "notifications" },
      { key: "mail", href: "/admin/mail", Icon: Mail, can: "notifications" },
      { key: "messages", href: "/admin/messages", Icon: MessagesSquare, can: "support" },
      { key: "feedback", href: "/admin/feedback", Icon: ThumbsUp, can: "support" },
    ],
  },
  {
    key: "system",
    items: [
      { key: "siteSettings", href: "/admin/site-settings", Icon: Settings2, can: "settings" },
      { key: "blacklist", href: "/admin/blacklist", Icon: Ban, can: "settings" },
      { key: "integrations", href: "/admin/integrations", Icon: PlugZap, can: "settings" },
      { key: "audit", href: "/admin/audit", Icon: History, can: "staff" },
    ],
  },
];

/** Admin menu showing only the sections the staff member's role allows, with queue counts; a scrolling row on small screens. */
export function AdminNav({ queues, permissions }: { queues: Overview["queues"] | null; permissions: string[] }) {
  const t = useTranslations("Admin.nav");
  const pathname = usePathname();

  const groups = GROUPS.map((group) => ({ ...group, items: group.items.filter((item) => permissions.includes(item.can)) })).filter((group) => group.items.length);
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
                  {count > 0 && <span className="rounded-full bg-badge px-1.5 text-xs text-white">{count}</span>}
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
function AdminSidebar({ groups, queues, isActive }: { groups: typeof GROUPS; queues: Overview["queues"] | null; isActive: (href: string) => boolean }) {
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
                    {count > 0 && <span className="ms-auto rounded-full bg-badge px-1.5 text-xs text-white">{count}</span>}
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
