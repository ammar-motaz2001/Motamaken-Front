import { Flag } from "lucide-react";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { ActionButton, AdminHeader, AdminSearch, AdminSection, BarList, Cell, AdminTable, ExportLink, StatCard, UserCell, date, type AdminReview, type List } from "@/modules/admin";
import { adminGet } from "@/modules/admin/server";

type Summary = { average: number; total: number; hidden: number; stars: Record<string, number> };

export default async function AdminReviews({ params, searchParams }: PageProps<"/[locale]/admin/reviews">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const filter = pickParams(query, ["rating", "state", "about", "userId", "q"]);
  const [t, locale, result] = await Promise.all([
    getTranslations("Admin.reviews"),
    getLocale(),
    adminGet<List<AdminReview> & { summary: Summary }>(`/admin/reviews${toQuery({ ...filter, page: pageParam(query) })}`),
  ]);
  const { summary } = result;

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} actions={<ExportLink dataset="reviews" query={filter} />} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="grid grid-cols-3 gap-3 self-start">
          <StatCard label={t("average")} value={summary.average ? `${summary.average} ★` : "—"} tone="orange" />
          <StatCard label={t("total")} value={summary.total} />
          <StatCard label={t("hiddenCount")} value={summary.hidden} href="/admin/reviews?state=hidden" />
        </div>
        <AdminSection>
          <BarList rows={[5, 4, 3, 2, 1].map((star) => ({ label: "★".repeat(star), value: summary.stars[star] ?? 0, tone: "bg-orange" }))} />
        </AdminSection>
      </div>
      <AdminSection>
        <AdminSearch
          placeholder={t("search")}
          filters={[
            { name: "rating", label: t("anyRating"), options: [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: "★".repeat(n) })) },
            { name: "about", label: t("aboutAnyone"), options: (["client", "freelancer", "influencer"] as const).map((value) => ({ value, label: t(`about.${value}`) })) },
            { name: "state", label: t("anyState"), options: [{ value: "visible", label: t("visible") }, { value: "hidden", label: t("hidden") }] },
          ]}
        />
        <AdminTable head={[t("review"), t("from"), t("aboutColumn"), t("project"), ""]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((r) => (
            <tr key={r.id} className={r.hidden ? "opacity-60" : ""}>
              <Cell className="max-w-sm">
                <span className="text-orange">{"★".repeat(r.rating)}</span>
                {r.comment && <p className="mt-1 text-sm">{r.comment}</p>}
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                  {date(r.createdAt, locale)}
                  {r.reports > 0 && (
                    <span className="flex items-center gap-1 text-danger">
                      <Flag className="size-3" /> {t("reports", { count: r.reports })}
                    </span>
                  )}
                  {r.hidden && <span className="text-danger">{t("hiddenBecause", { reason: r.hiddenReason ?? "" })}</span>}
                </div>
              </Cell>
              <Cell>
                <UserCell user={r.reviewer} />
              </Cell>
              <Cell>
                <UserCell user={r.reviewee} />
                <StatusPill tone="muted">{t(`about.${r.about}`)}</StatusPill>
              </Cell>
              <Cell className="max-w-xs text-sm">
                {r.project ? (
                  <Link href={`/admin/projects/${r.project.id}`} className="hover:text-brand">
                    {r.project.title}
                  </Link>
                ) : (
                  "—"
                )}
              </Cell>
              <Cell>
                {r.hidden ? (
                  <ActionButton label={t("show")} tone="brand" endpoint={`/admin/reviews/${r.id}/unhide`} confirm={t("confirmShow")} />
                ) : (
                  <ActionButton label={t("hide")} tone="danger" endpoint={`/admin/reviews/${r.id}/hide`} description={t("hideHint")} fields={[{ name: "reason", label: t("reason"), type: "textarea", required: true }]} />
                )}
              </Cell>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/admin/reviews" query={filter} />
      </AdminSection>
    </>
  );
}
