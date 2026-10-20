import { ChevronDown, LifeBuoy, Search } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { apiGetOrNull } from "@/lib/api/server";
import { pickParams, toQuery } from "@/lib/params";
import { pageMetadata } from "@/lib/seo";

type FaqGroup = { id: number; name: string; faqs: { id: number; question: string; answer: string; audience: string }[] };

const AUDIENCES = ["client", "freelancer", "influencer"] as const;

export async function generateMetadata({ params }: PageProps<"/[locale]/faq">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Faq" });
  return pageMetadata({ title: `${t("title")} | Mutamakin`, description: t("subtitle"), path: "/faq", locale });
}

export default async function FaqPage({ params, searchParams }: PageProps<"/[locale]/faq">) {
  setRequestLocale((await params).locale);
  const filter = pickParams(await searchParams, ["q", "audience"]);
  const [t, result] = await Promise.all([getTranslations("Faq"), apiGetOrNull<{ data: FaqGroup[] }>(`/faqs${toQuery(filter)}`)]);
  const groups = result?.data ?? [];
  const tab = (audience?: string) => `/faq${toQuery({ q: filter.q, audience })}`;

  return (
    <div className="page-container flex max-w-4xl flex-col gap-8 py-10">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="max-w-xl text-muted">{t("subtitle")}</p>
        <form action="" className="mt-2 flex w-full max-w-xl items-center gap-2 rounded-full border border-border bg-surface px-4 focus-within:border-brand">
          <Search className="size-4 shrink-0 text-muted" aria-hidden />
          <input name="q" defaultValue={filter.q} placeholder={t("search")} aria-label={t("search")} className="h-12 min-w-0 flex-1 bg-transparent outline-none" />
          {filter.audience && <input type="hidden" name="audience" value={filter.audience} />}
        </form>
        <nav className="flex flex-wrap justify-center gap-2" aria-label={t("for")}>
          {[undefined, ...AUDIENCES].map((audience) => (
            <Link
              key={audience ?? "all"}
              href={tab(audience)}
              aria-current={filter.audience === audience ? "page" : undefined}
              className={`rounded-full border px-4 py-1.5 text-sm ${filter.audience === audience ? "border-brand bg-brand text-white" : "border-border hover:border-brand"}`}
            >
              {t(`audiences.${audience ?? "all"}`)}
            </Link>
          ))}
        </nav>
      </header>

      {groups.length === 0 ? (
        <p className="py-10 text-center text-muted">{filter.q ? t("noResults", { q: filter.q }) : t("empty")}</p>
      ) : (
        groups.map((group) => (
          <section key={group.id} className="flex flex-col gap-3">
            <h2 className="text-xl font-bold">{group.name}</h2>
            <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface">
              {group.faqs.map((faq) => (
                <details key={faq.id} className="group px-5 py-4" open={Boolean(filter.q)}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium">
                    {faq.question}
                    <ChevronDown className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ))
      )}

      <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface-muted p-6 text-center">
        <LifeBuoy className="size-8 text-brand" aria-hidden />
        <p className="font-semibold">{t("stillNeedHelp")}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/support/new" className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white">
            {t("contactSupport")}
          </Link>
          <Link href="/contact" className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:border-brand">
            {t("contactForm")}
          </Link>
        </div>
      </div>
    </div>
  );
}
