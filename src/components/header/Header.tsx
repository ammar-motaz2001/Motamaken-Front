import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { Link } from "@/i18n/navigation";
import { formatAmount } from "@/lib/format";
import { AccountLinks } from "./AccountLinks";
import { AccountMenu } from "./AccountMenu";
import { CategoriesMenu } from "./CategoriesMenu";
import { CurrencySwitcher } from "./CurrencySwitcher";
import type { HeaderData } from "./data";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileMenu } from "./MobileMenu";
import { NAV_ITEMS } from "./nav";
import { NotificationsMenu } from "./NotificationsMenu";
import { HideOnAuthPages } from "./HideOnAuthPages";
import { SearchBar } from "./SearchBar";
import { AuthLink } from "@/components/AuthLink";
import { ThemeToggle } from "./ThemeToggle";
import { buttonClasses } from "@/components/ui/Button";

/** Thin vertical line between items of the header's top bar. */
function Divider() {
  return <span className="h-4 w-[0.5px] bg-foreground" aria-hidden />;
}

/** Small rounded figure in the header (e.g. the points balance) with its icon and a tooltip. */
function Pill({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <span
      title={label}
      className="flex h-9 min-w-[64px] items-center justify-center gap-1.5 rounded-[7px] border border-brand bg-surface px-2.5 text-[15px] font-semibold text-muted"
    >
      <Image src={icon} alt={label} width={18} height={18} className="size-[18px] shrink-0" />
      <span dir="ltr" className="trim-text tabular-nums">{value}</span>
    </span>
  );
}

/** Site header: logo, search, language/currency/theme switches, account menu or sign-in links, and the main navigation. */
export function Header({ signedIn, data, currency }: { signedIn: boolean; data: HeaderData; currency: string }) {
  const t = useTranslations("Header");
  const locale = useLocale();
  const { summary } = data;

  return (
    <header className="relative z-20 bg-surface drop-shadow-[0_4px_2px_rgba(213,213,213,0.25)] dark:drop-shadow-none">
      <div className="border-b-[0.75px] border-border bg-[url(/images/header-bg.png)] bg-cover bg-center py-4 dark:bg-none">
        <div className="page-container flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="Mutamakin" className="flex shrink-0 flex-col gap-1">
              <Image src="/images/logo.png" alt="Mutamakin" width={158} height={42} priority className="h-[42px] w-auto" />
              <span dir="rtl" className="text-end text-sm leading-none font-medium tracking-[-0.154px]">
                مـــتـــــمــــكــن.
              </span>
            </Link>
            {summary && (
              <div className="hidden items-center gap-2 md:flex">
                <Pill
                  icon="/images/coin.svg"
                  label={t("balance")}
                  value={formatAmount(summary.wallet.balance, summary.wallet.currency, locale)}
                />
                <Pill icon="/images/wallet.svg" label={t("points")} value={String(summary.points)} />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {!signedIn && (
              <div className="hidden items-center gap-2.5 lg:flex">
                <AccountLinks signedIn={false} />
                <Divider />
              </div>
            )}
            <div className="hidden items-center gap-2.5 lg:flex">
              <LocaleSwitcher signedIn={signedIn} />
              <Divider />
              <CurrencySwitcher currencies={data.currencies} initial={currency} signedIn={signedIn} />
              <Divider />
              <ThemeToggle signedIn={signedIn} />
              <Divider />
            </div>
            {signedIn ? (
              <>
                <Link href="/messages" aria-label={t("account.messages")} className="relative flex items-center px-1 py-[7.5px]">
                  <Image src="/images/messages.svg" alt="" width={20} height={20} className="dark:invert" />
                  <Badge count={summary?.unreadMessages ?? 0} className="-top-1 start-3" />
                </Link>
                <Divider />
                <NotificationsMenu unread={summary?.unreadNotifications ?? 0} />
                <span className="hidden items-center gap-2.5 lg:flex">
                  <Divider />
                  <Link href="/favorites" aria-label={t("favorites")} className="relative flex items-center px-1 py-[7.5px]">
                    <Image src="/images/heart.svg" alt="" width={20} height={20} className="dark:invert" />
                    <Badge count={summary?.counts?.favorites ?? 0} tone="brand" className="-top-1 start-3" />
                  </Link>
                  {summary && (
                    <>
                      <Divider />
                      <AccountMenu user={summary.user} unreadMessages={summary.unreadMessages} counts={summary.counts} />
                    </>
                  )}
                </span>
              </>
            ) : (
              <AuthLink href="/notifications" aria-label={t("notification")} className="flex items-center gap-1 rounded-md px-1 py-[7.5px]">
                <Image src="/images/notification.svg" alt="" width={20} height={20} className="dark:invert" />
                <span className="trim-text hidden text-base lg:inline">{t("notification")}</span>
              </AuthLink>
            )}
            <MobileMenu signedIn={signedIn} currencies={data.currencies} currency={currency} />
          </div>
        </div>
      </div>

      <HideOnAuthPages>
      <div className="pt-2 pb-6">
        <div className="page-container flex flex-wrap items-stretch justify-between gap-3 lg:flex-nowrap">
          <div className="flex min-w-0 flex-1 items-stretch gap-3 lg:flex-none">
            <Link
              href="/services"
              aria-label={t("openMenu")}
              className="hidden shrink-0 items-center justify-center rounded-md bg-border p-3 lg:flex"
            >
              <Image src="/images/menu.svg" alt="" width={20} height={20} className="dark:invert" />
            </Link>

            <SearchBar countries={data.countries} />

            <Link
              href="/search?type=projects&advanced=1"
              className={`${buttonClasses({ variant: "outlineOrange", font: "button", size: "sm" })} w-[110px] shrink-0 max-md:hidden`}
            >
              {t("advanced")}
            </Link>
          </div>

          <Link
            href="/projects/new"
            className={`${buttonClasses({ font: "button" })} w-full lg:w-[235px]`}
          >
            {t("postProject")}
          </Link>
        </div>
      </div>

      <nav aria-label="Main" className="relative hidden h-[66px] items-center justify-center bg-nav lg:flex">
        <ul className="flex items-center gap-3 px-4">
          {NAV_ITEMS.map((item) =>
            "hasMenu" in item ? (
              <CategoriesMenu key={item.key} categories={data.categories} />
            ) : (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="flex h-[35px] items-center gap-2 px-4 py-2.5 text-base font-bold whitespace-nowrap text-white hover:opacity-85"
                >
                  {t(`nav.${item.key}`)}
                </Link>
              </li>
            ),
          )}
        </ul>
      </nav>
      </HideOnAuthPages>
    </header>
  );
}
