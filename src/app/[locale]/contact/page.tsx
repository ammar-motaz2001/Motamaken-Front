import { Clock, LifeBuoy, Mail, ShieldCheck } from "lucide-react";
import { cookies } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { apiGetOrNull } from "@/lib/api/server";
import type { SitePage } from "@/lib/api/types";
import { SESSION_COOKIE } from "@/lib/session";
import { pageMetadata } from "@/lib/seo";
import { ContactForm, SitePageView } from "@/modules/pages";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  const [t, seo] = await Promise.all([getTranslations({ locale, namespace: "SitePages.contact" }), getTranslations({ locale, namespace: "Seo" })]);
  return pageMetadata({ title: `${t("pageTitle")} | Mutamakin`, description: seo("contact"), path: "/contact", locale });
}

export default async function Contact({ params }: PageProps<"/[locale]/contact">) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("SitePages.contact");
  const signedIn = (await cookies()).has(SESSION_COOKIE);
  const page = (await apiGetOrNull<{ data: SitePage }>("/pages/contact"))?.data ?? { slug: "contact", section: "help", title: t("pageTitle"), body: "", updatedAt: null };

  const facts = [
    { Icon: Clock, title: t("facts.replyTitle"), text: t("facts.reply") },
    { Icon: Mail, title: t("facts.emailTitle"), text: "support@mutamakin.com" },
    { Icon: ShieldCheck, title: t("facts.disputeTitle"), text: t("facts.dispute") },
    { Icon: LifeBuoy, title: t("facts.helpTitle"), text: t("facts.help") },
  ];

  return (
    // The page's text is shown in the banner; the main column is the form.
    <SitePageView
      page={{ ...page, body: "", updatedAt: null }}
      aside={
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {facts.map(({ Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-bold">{title}</span>
                <span className="text-sm break-words text-muted">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      }
    >
      <ContactForm signedIn={signedIn} />
    </SitePageView>
  );
}
