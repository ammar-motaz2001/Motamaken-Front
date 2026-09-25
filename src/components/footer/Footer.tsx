import Image from "next/image";
import { useTranslations } from "next-intl";
import { FaApple, FaGooglePlay, FaInstagram, FaSquareFacebook, FaTiktok, FaXTwitter } from "react-icons/fa6";
import { Link } from "@/i18n/navigation";

const CTAS = [
  { key: "freelancer", action: "postProject", href: "/projects/new" },
  { key: "professional", action: "postProject", href: "/projects/new" },
  { key: "brand", action: "postInfluencer", href: "/influencers/new" },
  { key: "influencer", action: "postInfluencer", href: "/influencers/new" },
] as const;

const COLUMNS = [
  {
    title: "information",
    links: [
      { key: "services", href: "/services" },
      { key: "categories", href: "/categories" },
      { key: "guide", href: "/guide" },
      { key: "sitemap", href: "/sitemap" },
      { key: "contact", href: "/contact" },
      { key: "blackList", href: "/black-list" },
      { key: "guarantee", href: "/guarantee-of-rights" },
    ],
  },
  {
    title: "customLinks",
    links: [
      { key: "evaluation", href: "/evaluation-system" },
      { key: "disputes", href: "/disputes-system" },
      { key: "bidding", href: "/bidding-system" },
      { key: "affiliate", href: "/affiliate-system" },
    ],
  },
  {
    title: "knowMore",
    links: [
      { key: "paymentProtection", href: "/payment-protection" },
      { key: "verification", href: "/account-verification" },
      { key: "siteFees", href: "/site-fees" },
      { key: "paymentMethod", href: "/payment-methods" },
      { key: "points", href: "/points-and-gifts" },
    ],
  },
  {
    title: "helpSupport",
    links: [
      { key: "account", href: "/account" },
      { key: "projects", href: "/projects" },
      { key: "payments", href: "/payments" },
      { key: "support", href: "/support" },
    ],
  },
] as const;

const SOCIALS = [
  { label: "X", href: "https://x.com", Icon: FaXTwitter },
  { label: "Facebook", href: "https://facebook.com", Icon: FaSquareFacebook },
  { label: "TikTok", href: "https://tiktok.com", Icon: FaTiktok },
  { label: "Instagram", href: "https://instagram.com", Icon: FaInstagram },
];

const LEGAL = [
  { key: "userAgreement", href: "/user-agreement" },
  { key: "privacyPolicy", href: "/privacy-policy" },
  { key: "terms", href: "/terms" },
] as const;

function StoreBadge({ href, icon, caption, store }: { href: string; icon: React.ReactNode; caption: string; store: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex h-[50px] items-center gap-2 rounded-lg border border-[#a6a6a6] bg-black px-3 text-white transition-opacity hover:opacity-85"
    >
      {icon}
      <span className="flex flex-col leading-none">
        <span className="text-[10px] uppercase">{caption}</span>
        <span className="text-xl font-medium">{store}</span>
      </span>
    </a>
  );
}

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="mt-10">
      <div className="relative z-10 px-4">
        <div className="mx-auto grid max-w-[1352px] grid-cols-1 gap-6 rounded-2xl bg-nav px-6 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
          {CTAS.map((cta) => (
            <div key={cta.key} className="flex flex-col items-center justify-between gap-3 text-center">
              <p className="max-w-[260px] text-base leading-tight font-bold text-white">{t(`cta.${cta.key}`)}</p>
              <Link
                href={cta.href}
                className="rounded-md bg-gradient-orange px-4 py-2 text-sm font-medium whitespace-nowrap text-white transition-opacity hover:opacity-90"
              >
                {t(`cta.${cta.action}`)}
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="-mt-16 bg-surface-muted pt-28 pb-8">
        <div className="page-container">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_235px]">
            {COLUMNS.map((column, index) => (
              <div key={column.title}>
                <h3 className={`mb-6 font-bold ${index === 0 ? "text-xl" : "text-lg"}`}>{t(column.title)}</h3>
                <ul className="flex flex-col gap-4">
                  {column.links.map((link) => (
                    <li key={link.key}>
                      <Link href={link.href} className="text-sm transition-colors hover:text-brand">
                        {t(`links.${link.key}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="col-span-2 flex flex-col items-center gap-5 md:col-span-4 lg:col-span-1">
              <Image src="/images/logo.svg" alt="Motamakin" width={169.691} height={48} className="self-center" />
              <ul className="flex gap-3">
                {SOCIALS.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className="flex size-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:border-brand hover:text-brand"
                    >
                      <Icon className="size-[18px]" />
                    </a>
                  </li>
                ))}
              </ul>
              <Link
                href="/projects/new"
                className="flex h-[42px] w-full max-w-[235px] items-center justify-center rounded-md bg-gradient-brand font-button text-sm font-semibold text-white hover:opacity-90"
              >
                {t("postProject")}
              </Link>
              <Link
                href="/invite"
                className="flex h-[42px] w-full max-w-[235px] items-center justify-center rounded-md border border-brand-border bg-surface font-button text-sm font-semibold hover:opacity-90"
              >
                <span className="text-gradient-brand">{t("inviteFriend")}</span>
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <StoreBadge
              href="https://play.google.com"
              icon={<FaGooglePlay className="size-6" />}
              caption={t("getItOn")}
              store="Google Play"
            />
            <StoreBadge
              href="https://apps.apple.com"
              icon={<FaApple className="size-7" />}
              caption={t("downloadOn")}
              store="App Store"
            />
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6 text-sm md:flex-row md:items-center md:justify-between">
            <p>{t("rights", { year: new Date().getFullYear() })}</p>
            <ul className="flex flex-wrap items-center">
              {LEGAL.map((link) => (
                <li key={link.key} className="border-s border-foreground px-2 leading-none">
                  <Link href={link.href} className="transition-colors hover:text-brand">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
