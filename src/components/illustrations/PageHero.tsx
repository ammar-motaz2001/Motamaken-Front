import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { Illustration, type IllustrationName } from "./Illustration";

type PageHeroProps = {
  crumbs: { label: string; href?: string }[];
  title: string;
  subtitle?: string;
  illustration: IllustrationName;
  children?: ReactNode;
};

/** Full-width banner at the top of content pages: breadcrumb, title, a short line and a brand illustration. */
export function PageHero({ crumbs, title, subtitle, illustration, children }: PageHeroProps) {
  const tc = useTranslations("Common");
  return (
    <section className="relative overflow-hidden rounded-3xl border border-brand/15 bg-gradient-to-br from-brand-soft via-surface to-orange/5">
      <div className="pointer-events-none absolute -end-16 -top-16 size-64 rounded-full bg-brand/10 blur-2xl" aria-hidden />
      <div className="relative grid items-center gap-6 px-6 py-8 sm:px-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:px-14 lg:py-12">
        <div className="flex flex-col gap-4">
          <nav aria-label={tc("breadcrumb")} className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
            {crumbs.map((crumb, index) => (
              <span key={crumb.label} className="flex items-center gap-1.5">
                {index > 0 && <span aria-hidden>/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-brand">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-foreground">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
          <h1 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl lg:text-5xl">{title}</h1>
          {subtitle && <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">{subtitle}</p>}
          {children}
        </div>
        <Illustration name={illustration} className="mx-auto w-full max-w-[420px]" />
      </div>
    </section>
  );
}
