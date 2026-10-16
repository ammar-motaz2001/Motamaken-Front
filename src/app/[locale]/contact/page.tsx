import { cookies } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { apiGetOrNull } from "@/lib/api/server";
import type { SitePage } from "@/lib/api/types";
import { SESSION_COOKIE } from "@/lib/session";
import { ContactForm, SitePageView } from "@/modules/pages";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "SitePages.contact" });
  return { title: `${t("pageTitle")} | Mutamakin` };
}

export default async function Contact({ params }: PageProps<"/[locale]/contact">) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("SitePages.contact");
  const signedIn = (await cookies()).has(SESSION_COOKIE);
  const page = (await apiGetOrNull<{ data: SitePage }>("/pages/contact"))?.data ?? { slug: "contact", section: "help", title: t("pageTitle"), body: "", updatedAt: null };

  return (
    <SitePageView page={{ ...page, updatedAt: null }}>
      <ContactForm signedIn={signedIn} />
    </SitePageView>
  );
}
