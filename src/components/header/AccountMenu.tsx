"use client";

import Image from "next/image";
import {
  ChevronDown,
  Crown,
  FilePlus2,
  FolderKanban,
  Handshake,
  LogOut,
  MessageSquare,
  Scale,
  Settings,
  ShieldCheck,
  Star,
  TrendingUp,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState, useTransition } from "react";
import { Badge } from "@/components/ui/Badge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useDismiss } from "@/components/ui/useDismiss";
import { Link, useRouter } from "@/i18n/navigation";
import type { User as ApiUser } from "@/lib/api/types";
import { deleteSession } from "@/modules/auth/actions";

const LINKS = [
  { key: "profile", href: "/profile", Icon: User },
  { key: "settings", href: "/settings", Icon: Settings },
  { key: "messages", href: "/messages", Icon: MessageSquare },
] as const;

const MORE_LINKS = [
  { key: "myOffers", href: "/offers", Icon: Handshake },
  { key: "myProjects", href: "/my-projects", Icon: FolderKanban },
  { key: "myTeams", href: "/teams", Icon: Users },
  { key: "myReviews", href: "/reviews", Icon: Star },
] as const;

const EXTRA_LINKS = [
  { key: "campaigns", href: "/settings/campaigns", Icon: TrendingUp },
  { key: "inviteFriend", href: "/settings/invite", Icon: UserPlus },
  { key: "disputes", href: "/disputes", Icon: Scale },
] as const;

const itemClasses = "flex w-full items-center gap-2 px-3 py-2 text-start text-sm hover:bg-surface-muted";

/** Avatar menu of a signed-in user: account links, unread message count, post a project/request and sign out. */
export function AccountMenu({ user, unreadMessages }: { user: ApiUser; unreadMessages: number }) {
  const t = useTranslations("Header");
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, ref, close);

  const logout = () =>
    startTransition(async () => {
      await deleteSession();
      router.replace("/login");
      router.refresh();
    });

  const renderLink = ({ key, href, Icon }: { key: string; href: string; Icon: typeof User }) => (
    <li key={key}>
      <Link href={key === "myReviews" ? `/users/${user.id}?tab=reviews` : href} onClick={close} className={itemClasses}>
        <Icon className="size-4 text-muted" />
        {t(`account.${key}`)}
        {key === "messages" && unreadMessages > 0 && (
          <span className="ms-auto rounded-full bg-badge px-1.5 text-xs text-white">{unreadMessages}</span>
        )}
      </Link>
    </li>
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative flex items-center gap-1 py-[7.5px]"
      >
        <UserAvatar name={user.fullName} src={user.avatarUrl} size={24} />
        <span className="max-w-32 truncate text-base font-medium text-orange capitalize">{user.username}</span>
        <Image src="/images/arrow-down-sm.svg" alt="" width={12} height={12} className="dark:invert" />
        <Badge count={unreadMessages} className="-top-1.5 -start-2" />
      </button>

      {open && (
        <div role="menu" className="absolute end-0 top-full z-40 mt-2 w-[213px] rounded-lg border border-border bg-surface py-1.5 shadow-card">
          <ul>
            {user.isAdmin && (
              <li>
                <Link href="/admin" onClick={close} className={`${itemClasses} font-medium text-brand`}>
                  <ShieldCheck className="size-4" />
                  {t("account.admin")}
                </Link>
              </li>
            )}
            {LINKS.map(renderLink)}
            <li>
              <button type="button" onClick={() => setPostOpen((value) => !value)} aria-expanded={postOpen} className={itemClasses}>
                <FilePlus2 className="size-4 text-muted" />
                {t("postProject")}
                <ChevronDown className={`ms-auto size-4 transition-transform ${postOpen ? "rotate-180" : ""}`} />
              </button>
              {postOpen && (
                <ul className="ms-6 border-s border-border">
                  <li>
                    <Link href="/projects/new" onClick={close} className={`${itemClasses} text-brand`}>
                      {t("account.projectForFreelancers")}
                    </Link>
                  </li>
                  <li>
                    <Link href="/influencers/new" onClick={close} className={`${itemClasses} text-brand`}>
                      {t("account.requestForInfluencers")}
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            {MORE_LINKS.map(renderLink)}
            <li>
              <Link href="/premium" onClick={close} className={`${itemClasses} bg-orange/10 text-orange hover:bg-orange/15`}>
                <Crown className="size-4" />
                {t("account.premium")}
              </Link>
            </li>
            {EXTRA_LINKS.map(renderLink)}
          </ul>
          <div className="mt-1 border-t border-border pt-1">
            <button type="button" onClick={logout} disabled={pending} className={`${itemClasses} text-danger disabled:opacity-50`}>
              <LogOut className="size-4" />
              {t("logout")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
