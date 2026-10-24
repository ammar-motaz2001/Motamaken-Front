import {
  Banknote,
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
import type { Overview } from "../types";

type Queue = keyof Overview["queues"];

export type NavItem = { key: string; href: string; Icon: LucideIcon; can: string; queue?: Queue };

/** The admin panel's sections, grouped as in the menu, each with the permission it needs. */
export const ADMIN_GROUPS: { key: string; items: NavItem[] }[] = [
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
      { key: "currencies", href: "/admin/currencies", Icon: Banknote, can: "settings" },
      { key: "blacklist", href: "/admin/blacklist", Icon: Ban, can: "settings" },
      { key: "integrations", href: "/admin/integrations", Icon: PlugZap, can: "settings" },
      { key: "audit", href: "/admin/audit", Icon: History, can: "staff" },
    ],
  },
];

/**
 * Where a staff member lands in the panel: the overview when their role allows it, otherwise the first section it does
 * (a role that only sees users goes straight to Users instead of an error page).
 */
export function firstAdminPath(permissions: string[]): string {
  for (const group of ADMIN_GROUPS) {
    for (const item of group.items) {
      if (permissions.includes(item.can)) return item.href;
    }
  }
  return "/";
}
