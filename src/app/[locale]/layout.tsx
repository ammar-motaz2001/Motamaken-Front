import type { Metadata, Viewport } from "next";
import { Mulish, Quicksand, Tajawal } from "next/font/google";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { preload } from "react-dom";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/footer/Footer";
import { getHeaderData } from "@/components/header/data";
import { MaintenanceGate } from "@/components/MaintenanceGate";
import { getSiteSettings, getSummary } from "@/lib/api/reference";
import { Header } from "@/components/header/Header";
import { FavoritesProvider } from "@/components/providers/FavoritesProvider";
import { PaymentsProvider } from "@/components/providers/PaymentsProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { routing } from "@/i18n/routing";
import { SESSION_COOKIE } from "@/lib/session";
import { AuthGateProvider } from "@/components/providers/AuthGateProvider";
import { WelcomeToast } from "@/components/providers/WelcomeToast";
import { getAuthMethods } from "@/modules/auth/lib/settings";
import { StructuredData } from "@/components/StructuredData";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import "../globals.css";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["600"],
});

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  weight: ["300", "600"],
});

/** Pre-renders the layout once per supported language (English and Arabic). */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Default title, description and social card for every page; public pages override them with their own. */
export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const [t, site] = await Promise.all([getTranslations({ locale, namespace: "Metadata" }), getSiteSettings()]);
  // The admins' default description (Site settings › SEO) wins over the built-in one.
  const description = (locale === "ar" ? site?.seo?.descriptionAr : site?.seo?.descriptionEn) || t("description");
  // Defaults for every page; public pages add their own canonical link, language links and social card (lib/seo.ts).
  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description,
    applicationName: SITE_NAME,
    formatDetection: { telephone: false },
    openGraph: { type: "website", siteName: SITE_NAME, title: t("title"), description, images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE_NAME }] },
    twitter: { card: "summary_large_image", images: ["/og.png"] },
  };
}

/** Browser bar colour that follows the light or dark system theme. */
export function generateViewport(): Viewport {
  return {
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#ffffff" },
      { media: "(prefers-color-scheme: dark)", color: "#121212" },
    ],
  };
}

/** Root layout for every page: checks the language, sets fonts and direction, header and footer; non-staff see maintenance mode when on. */
export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  // The loading animation is fetched with the page, so it shows at once the first time it is needed.
  preload("/images/loader.gif", { as: "image" });
  // The header background is a CSS image (found late) and the largest paint on phones: fetch it first.
  preload("/images/header-bg.png", { as: "image", fetchPriority: "high" });
  const signedIn = (await cookies()).has(SESSION_COOKIE);
  const [headerData, authMethods, seoDescription, site] = await Promise.all([
    getHeaderData(signedIn),
    getAuthMethods(),
    getTranslations({ locale, namespace: "Seo" }).then((t) => t("home")),
    getSiteSettings(),
  ]);
  // The admin texts are a third of the bundle; only the admin panel sends them to the browser (see admin/layout.tsx).
  const publicMessages = { ...(await getMessages()) };
  delete publicMessages.Admin;
  // Only checked while maintenance is on, to let the staff through.
  // Newer APIs say which Moyasar key is in use (null: cards off); older ones leave it to the build-time key.
  const moyasarKey = site?.payments ? site.payments.moyasarPublishableKey : (process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY ?? null);
  const isStaff = Boolean(site?.maintenance.enabled && signedIn && (await getSummary())?.user.isAdmin);

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${tajawal.variable} ${quicksand.variable} ${mulish.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col">
        <StructuredData locale={locale} description={seoDescription} />
        <NextIntlClientProvider messages={publicMessages}>
          <ThemeProvider>
            <AuthGateProvider signedIn={signedIn} methods={authMethods}>
              <PaymentsProvider moyasarKey={moyasarKey}>
                <FavoritesProvider signedIn={signedIn}>
                  <Header signedIn={signedIn} data={headerData} />
                  <main className="flex-1">
                    <MaintenanceGate maintenance={site?.maintenance ?? null} isStaff={isStaff}>
                      {children}
                    </MaintenanceGate>
                  </main>
                  <Footer site={site} />
                </FavoritesProvider>
              </PaymentsProvider>
              <WelcomeToast />
            </AuthGateProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
