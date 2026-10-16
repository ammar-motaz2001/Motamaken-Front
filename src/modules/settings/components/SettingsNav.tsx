"use client";

import {
  Bell,
  ChevronDown,
  CircleUser,
  CreditCard,
  FileWarning,
  FolderKanban,
  Gift,
  Handshake,
  KeyRound,
  Landmark,
  Medal,
  Megaphone,
  MonitorCheck,
  Scale,
  ShieldCheck,
  Heart,
  MousePointerClick,
  TrendingUp,
  UserPlus,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";

const MAIN = [
  { key: "profile", href: "/settings/profile", Icon: CircleUser },
  { key: "notifications", href: "/settings/notifications", Icon: Bell },
  { key: "password", href: "/settings/password", Icon: KeyRound },
  { key: "payment", href: "/settings/payment", Icon: CreditCard },
  { key: "security", href: "/settings/security", Icon: ShieldCheck },
  { key: "verification", href: "/settings/verification", Icon: MonitorCheck },
  { key: "offers", href: "/offers", Icon: Handshake },
  { key: "projects", href: "/my-projects", Icon: FolderKanban },
  { key: "influencerRequests", href: "/my-projects?type=influencer_request", Icon: Megaphone },
] as const;

const MORE = [
  { key: "wallet", href: "/settings/wallet", Icon: Wallet },
  { key: "escrow", href: "/settings/escrow", Icon: Landmark },
  { key: "campaigns", href: "/settings/campaigns", Icon: TrendingUp },
  { key: "promoter", href: "/settings/promoter", Icon: MousePointerClick },
  { key: "favorites", href: "/favorites", Icon: Heart },
  { key: "invite", href: "/settings/invite", Icon: UserPlus },
  { key: "points", href: "/settings/points", Icon: Gift },
  { key: "medals", href: "/settings/medals", Icon: Medal },
  { key: "reports", href: "/settings/reports", Icon: FileWarning },
  { key: "disputes", href: "/disputes", Icon: Scale },
] as const;

export function SettingsNav() {
  const t = useTranslations("Settings.nav");
  const pathname = usePathname();
  const inMore = MORE.some((item) => pathname.startsWith(item.href));
  const [showMore, setShowMore] = useState(inMore);

  const renderItem = ({ key, href, Icon }: { key: string; href: string; Icon: typeof Bell }) => {
    const path = href.split("?")[0];
    const active = (pathname === path || (path === "/settings/campaigns" && pathname.startsWith(path))) && !href.includes("?");
    return (
      <li key={key}>
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
            active ? "bg-orange/10 font-medium text-orange" : "hover:bg-surface-muted"
          }`}
        >
          <Icon className="size-4 shrink-0" />
          {t(key)}
        </Link>
      </li>
    );
  };

  return (
    <nav aria-label={t("label")} className="rounded-xl border border-border bg-surface p-2.5 lg:sticky lg:top-4">
      <ul className="flex flex-col gap-0.5">
        {MAIN.map(renderItem)}
        {showMore && MORE.map(renderItem)}
      </ul>
      <button
        type="button"
        aria-expanded={showMore}
        onClick={() => setShowMore((value) => !value)}
        className="mt-1 flex w-full items-center justify-center gap-1.5 py-2 text-sm text-muted hover:text-foreground"
      >
        <ChevronDown className={`size-4 transition-transform ${showMore ? "rotate-180" : ""}`} />
        {showMore ? t("seeLess") : t("seeMore")}
      </button>
    </nav>
  );
}
