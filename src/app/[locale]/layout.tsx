import type { Metadata, Viewport } from "next";
import { Mulish, Quicksand, Tajawal } from "next/font/google";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { preload } from "react-dom";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/footer/Footer";
import { getHeaderData } from "@/components/header/data";
import { Header } from "@/components/header/Header";
import { FavoritesProvider } from "@/components/providers/FavoritesProvider";
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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  // Defaults for every page; public pages add their own canonical link, language links and social card (lib/seo.ts).
  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    applicationName: SITE_NAME,
    formatDetection: { telephone: false },
    openGraph: { type: "website", siteName: SITE_NAME, title: t("title"), description: t("description"), images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE_NAME }] },
    twitter: { card: "summary_large_image", images: ["/og.png"] },
  };
}

export function generateViewport(): Viewport {
  return {
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#ffffff" },
      { media: "(prefers-color-scheme: dark)", color: "#121212" },
    ],
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  // The loading animation is fetched with the page, so it shows at once the first time it is needed.
  preload("/images/loader.gif", { as: "image" });
  const signedIn = (await cookies()).has(SESSION_COOKIE);
  const [headerData, authMethods, seoDescription] = await Promise.all([
    getHeaderData(signedIn),
    getAuthMethods(),
    getTranslations({ locale, namespace: "Seo" }).then((t) => t("home")),
  ]);

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${tajawal.variable} ${quicksand.variable} ${mulish.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col">
        <StructuredData locale={locale} description={seoDescription} />
        <NextIntlClientProvider>
          <ThemeProvider>
            <AuthGateProvider signedIn={signedIn} methods={authMethods}>
              <FavoritesProvider signedIn={signedIn}>
                <Header signedIn={signedIn} data={headerData} />
                <main className="flex-1">{children}</main>
                <Footer />
              </FavoritesProvider>
              <WelcomeToast />
            </AuthGateProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
