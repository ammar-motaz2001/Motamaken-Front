import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AccountLinks } from "./AccountLinks";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileMenu } from "./MobileMenu";
import { NAV_ITEMS } from "./nav";
import { ThemeToggle } from "./ThemeToggle";

function Divider() {
  return <span className="h-4 w-[0.5px] bg-foreground" aria-hidden />;
}

function SelectField({ name, placeholder, options, className }: {
  name: string;
  placeholder: string;
  options: { value: string; label: string }[];
  className: string;
}) {
  return (
    <label className={`relative hidden h-[45px] items-center rounded-[5px] border border-border bg-surface xl:flex ${className}`}>
      <select
        name={name}
        defaultValue=""
        aria-label={placeholder}
        className="peer h-full w-full cursor-pointer appearance-none bg-transparent ps-2.5 pe-9 text-base outline-none has-[option[value='']:checked]:text-placeholder"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-foreground">
            {option.label}
          </option>
        ))}
      </select>
      <Image
        src="/images/arrow-down-outline.svg"
        alt=""
        width={20}
        height={20}
        className="pointer-events-none absolute end-2.5 dark:invert"
      />
    </label>
  );
}

export function Header({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations("Header");

  return (
    <header className="relative z-20 bg-surface drop-shadow-[0_4px_2px_rgba(213,213,213,0.25)] dark:drop-shadow-none">
      <div className="border-b-[0.75px] border-border bg-[url(/images/header-bg.png)] bg-cover bg-center py-4 dark:bg-none">
        <div className="page-container flex items-center justify-between gap-4">
          <Link href="/" aria-label="Motamakin" className="flex h-[51px] flex-col justify-end gap-1.5">
            <Image src="/images/logo.svg" alt="Motamakin" width={169.691} height={48} priority />
            <span dir="rtl" className="text-end text-sm leading-none font-medium tracking-[-0.154px]">
              مـــتـــــمــــكــن.
            </span>
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="hidden items-center gap-2.5 lg:flex">
              <AccountLinks signedIn={signedIn} />
              <Divider />
            </div>
            <button type="button" aria-label={t("notification")} className="flex items-center gap-1 rounded-md px-1 py-[7.5px]">
              <Image src="/images/notification.svg" alt="" width={20} height={20} className="dark:invert" />
              <span className="hidden text-base lg:inline">{t("notification")}</span>
            </button>
            <div className="hidden items-center gap-2.5 lg:flex">
              <Divider />
              <LocaleSwitcher />
              <Divider />
              <CurrencySwitcher />
              <Divider />
              <ThemeToggle />
              <Divider />
            </div>
            <MobileMenu signedIn={signedIn} />
          </div>
        </div>
      </div>

      <div className="pt-2 pb-6">
        <div className="page-container flex flex-wrap items-stretch justify-between gap-3 lg:flex-nowrap">
          <div className="flex min-w-0 flex-1 items-stretch gap-3 lg:flex-none">
            <button
              type="button"
              aria-label={t("openMenu")}
              className="hidden shrink-0 items-center justify-center rounded-md bg-border p-3 lg:flex"
            >
              <Image src="/images/menu.svg" alt="" width={20} height={20} className="dark:invert" />
            </button>

            <form role="search" action="/search" className="flex min-w-0 flex-1 gap-1 lg:flex-none">
              <div className="flex h-[45px] min-w-0 flex-1 items-center gap-[15px] rounded-[5px] border border-border bg-surface px-2.5 lg:w-[320px] lg:flex-none xl:w-[480px]">
                <button type="button" className="flex shrink-0 items-center gap-1 text-base font-medium whitespace-nowrap">
                  {t("allServices")}
                  <Image src="/images/arrow-down-dark.svg" alt="" width={20} height={20} className="dark:invert" />
                </button>
                <span className="h-[19px] w-px bg-border" aria-hidden />
                <input
                  name="q"
                  type="search"
                  placeholder={t("search")}
                  className="min-w-0 flex-1 bg-transparent text-base outline-none"
                />
                <button type="submit" aria-label={t("search")} className="shrink-0">
                  <Image src="/images/search.svg" alt="" width={20} height={20} />
                </button>
              </div>

              <SelectField
                name="country"
                placeholder={t("country")}
                className="w-[131px]"
                options={(["sa", "eg", "ae"] as const).map((value) => ({ value, label: t(`countries.${value}`) }))}
              />
              <SelectField
                name="city"
                placeholder={t("city")}
                className="w-[106px]"
                options={(["riyadh", "jeddah", "cairo"] as const).map((value) => ({ value, label: t(`cities.${value}`) }))}
              />
            </form>

            <Link
              href="/search/advanced"
              className="hidden w-[110px] shrink-0 items-center justify-center rounded-md border border-orange px-4 font-button text-sm font-semibold text-orange md:flex"
            >
              {t("advanced")}
            </Link>
          </div>

          <Link
            href="/projects/new"
            className="flex h-[45px] w-full items-center justify-center rounded-md bg-gradient-brand px-8 font-button text-sm font-semibold whitespace-nowrap text-white hover:opacity-90 lg:w-[235px]"
          >
            {t("postProject")}
          </Link>
        </div>
      </div>

      <nav aria-label="Main" className="hidden h-[66px] items-center justify-center bg-nav lg:flex">
        <ul className="flex items-center gap-3 px-4">
          {NAV_ITEMS.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                className="flex h-[35px] items-center gap-2 px-4 py-2.5 text-base font-bold whitespace-nowrap text-white hover:opacity-85"
              >
                {t(`nav.${item.key}`)}
                {"hasMenu" in item && <Image src="/images/arrow-down-white.svg" alt="" width={16} height={16} />}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
