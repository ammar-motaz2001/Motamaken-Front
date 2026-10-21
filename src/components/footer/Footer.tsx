import Image from "next/image";
import { useTranslations } from "next-intl";
import { FaApple, FaGooglePlay, FaInstagram, FaLinkedin, FaSnapchat, FaSquareFacebook, FaTiktok, FaWhatsapp, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { Mail, Phone } from "lucide-react";
import { AuthLink } from "@/components/AuthLink";
import { Link } from "@/i18n/navigation";
import type { PublicSiteSettings } from "@/lib/api/types";
import { buttonClasses } from "@/components/ui/Button";

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
      { key: "affiliate", href: "/settings/invite" },
    ],
  },
  {
    title: "knowMore",
    links: [
      { key: "paymentProtection", href: "/payment-protection" },
      { key: "verification", href: "/settings/verification" },
      { key: "siteFees", href: "/site-fees" },
      { key: "paymentMethod", href: "/settings/payment" },
      { key: "points", href: "/gifts" },
    ],
  },
  {
    title: "helpSupport",
    links: [
      { key: "account", href: "/settings/profile" },
      { key: "projects", href: "/projects" },
      { key: "payments", href: "/settings/wallet" },
      { key: "support", href: "/support" },
      { key: "faq", href: "/faq" },
    ],
  },
] as const;

/** Networks the admins can link under Site settings, in display order. */
const SOCIALS = [
  { key: "x", label: "X", Icon: FaXTwitter },
  { key: "facebook", label: "Facebook", Icon: FaSquareFacebook },
  { key: "instagram", label: "Instagram", Icon: FaInstagram },
  { key: "tiktok", label: "TikTok", Icon: FaTiktok },
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedin },
  { key: "youtube", label: "YouTube", Icon: FaYoutube },
  { key: "snapchat", label: "Snapchat", Icon: FaSnapchat },
] as const;

const LEGAL = [
  { key: "userAgreement", href: "/user-agreement" },
  { key: "privacyPolicy", href: "/privacy-policy" },
  { key: "terms", href: "/terms" },
] as const;

/** App Store / Google Play badge linking to the store page in a new tab. */
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

/** Site footer: call-to-action strip, info page links, social links and app badges set by the admins (site settings). */
export function Footer({ site }: { site: PublicSiteSettings | null }) {
  const t = useTranslations("Footer");
  const socials = SOCIALS.filter(({ key }) => site?.social[key]);

  return (
    <footer className="mt-10">
      <div className="page-container relative z-10">
        <div className="grid grid-cols-1 gap-6 rounded-2xl bg-nav px-6 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
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
                      {link.href.startsWith("/settings") ? (
                        <AuthLink href={link.href} className="text-sm transition-colors hover:text-brand">
                          {t(`links.${link.key}`)}
                        </AuthLink>
                      ) : (
                        <Link href={link.href} className="text-sm transition-colors hover:text-brand">
                          {t(`links.${link.key}`)}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="col-span-2 flex flex-col items-center gap-5 md:col-span-4 lg:col-span-1">
              {site?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- uploaded from the admin panel
                <img src={site.logoUrl} alt="Mutamakin" className="h-12 max-w-[181px] self-center object-contain" />
              ) : (
                <Image src="/images/logo.png" alt="Mutamakin" width={181} height={48} className="self-center" />
              )}
              {(site?.email || site?.phone || site?.whatsapp) && (
                <ul className="flex flex-col items-center gap-1.5 text-sm">
                  {site.email && (
                    <li>
                      <a href={`mailto:${site.email}`} className="flex items-center gap-1.5 hover:text-brand">
                        <Mail className="size-4" aria-hidden /> {site.email}
                      </a>
                    </li>
                  )}
                  {site.phone && (
                    <li>
                      <a href={`tel:${site.phone}`} className="flex items-center gap-1.5 hover:text-brand" dir="ltr">
                        <Phone className="size-4" aria-hidden /> {site.phone}
                      </a>
                    </li>
                  )}
                  {site.whatsapp && (
                    <li>
                      <a href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-brand" dir="ltr">
                        <FaWhatsapp className="size-4" aria-hidden /> {site.whatsapp}
                      </a>
                    </li>
                  )}
                </ul>
              )}
              <ul className="flex flex-wrap justify-center gap-3">
                {socials.map(({ key, label, Icon }) => (
                  <li key={key}>
                    <a
                      href={site?.social[key]}
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
                className={`${buttonClasses({ font: "button" })} w-full max-w-[235px]`}
              >
                {t("postProject")}
              </Link>
              <AuthLink
                href="/settings/invite"
                className={`${buttonClasses({ variant: "outline", font: "button" })} w-full max-w-[235px] text-brand`}
              >
                <span className="text-gradient-brand">{t("inviteFriend")}</span>
              </AuthLink>
            </div>
          </div>

          {(site?.apps.android || site?.apps.ios) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {site.apps.android && <StoreBadge href={site.apps.android} icon={<FaGooglePlay className="size-6" />} caption={t("getItOn")} store="Google Play" />}
              {site.apps.ios && <StoreBadge href={site.apps.ios} icon={<FaApple className="size-7" />} caption={t("downloadOn")} store="App Store" />}
            </div>
          )}

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
