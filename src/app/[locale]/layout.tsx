import type { Metadata } from "next";
import { Mulish, Quicksand, Tajawal } from "next/font/google";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
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
  return { title: t("title"), description: t("description") };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const signedIn = (await cookies()).has(SESSION_COOKIE);
  const [headerData, authMethods] = await Promise.all([getHeaderData(signedIn), getAuthMethods()]);

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${tajawal.variable} ${quicksand.variable} ${mulish.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col">
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
