import { Rocket, UserRoundCheck } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { panelClasses } from "@/components/ui/styles";
import type { User } from "@/lib/api/types";
import { FeatureButton } from "./FeatureButton";
import type { Promotion } from "./types";

type PremiumPageProps = { user: User | null; currency: string; promotions: (Promotion & { project: { id: number; title: string } | null })[] };

/** Premium page: cards to feature the profile or a project, and the user's current and past promotions. */
export async function PremiumPage({ user, currency, promotions }: PremiumPageProps) {
  const t = await getTranslations("Promotions");
  const format = await getFormatter();
  const button = "rounded-full bg-gradient-brand px-6 py-2.5 text-sm font-medium text-white hover:opacity-90";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader crumbs={[{ label: t("home"), href: "/" }, { label: t("premium.title") }]} title={t("premium.title")} subtitle={t("premium.subtitle")} />

      <div className="grid gap-4 md:grid-cols-2">
        {(
          [
            ["profile", UserRoundCheck],
            ["project", Rocket],
          ] as const
        ).map(([kind, Icon]) => (
          <section key={kind} className={`${panelClasses} flex flex-col items-start gap-3`}>
            <Icon className="size-10 text-brand" strokeWidth={1.4} aria-hidden />
            <h2 className="text-lg font-bold">{t(`${kind}.title`)}</h2>
            <p className="text-sm text-muted">{t(`${kind}.intro`)}</p>
            <FeatureButton kind={kind} user={user} currency={currency} className={button}>
              {t(`premium.${kind}Cta`)}
            </FeatureButton>
          </section>
        ))}
      </div>

      {user && (
        <section className={`${panelClasses} flex flex-col gap-3`}>
          <h2 className="text-lg font-bold">{t("premium.mine")}</h2>
          {promotions.length ? (
            <ul className="flex flex-col divide-y divide-border">
              {promotions.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <span>
                    <span className="font-bold">{item.kind === "profile" ? t("premium.yourProfile") : item.project?.title}</span>
                    <span className="block text-xs text-muted">
                      {item.package ? t(`packages.names.${item.package}`) : t("packages.days", { count: item.days })} ·{" "}
                      {format.number(item.price, { style: "currency", currency: item.currency })}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 text-xs text-muted">
                    {t("premium.until", { date: format.dateTime(new Date(item.endsAt), { dateStyle: "medium", timeStyle: "short" }) })}
                    <StatusPill tone={item.isActive ? "success" : "muted"}>{t(item.isActive ? "premium.active" : "premium.ended")}</StatusPill>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">{t("premium.none")}</p>
          )}
        </section>
      )}
    </div>
  );
}
