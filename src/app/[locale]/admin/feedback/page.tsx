import { ThumbsDown, ThumbsUp } from "lucide-react";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { apiGet } from "@/lib/api/server";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { AdminHeader, AdminSearch, AdminSection, AdminTable, Cell, StatCard, UserCell, dateTime, type AdminFeedback, type List } from "@/modules/admin";

type Result = List<AdminFeedback> & { summary: { context: string; up: number; down: number; satisfaction: number | null }[] };

export default async function AdminFeedbackPage({ params, searchParams }: PageProps<"/[locale]/admin/feedback">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const filter = pickParams(query, ["context", "rating"]);
  const [t, locale, result] = await Promise.all([
    getTranslations("Admin.feedback"),
    getLocale(),
    apiGet<Result>(`/admin/feedback${toQuery({ ...filter, page: pageParam(query) })}`),
  ]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {result.summary.map((row) => (
          <StatCard
            key={row.context}
            label={t(`contexts.${row.context}`)}
            value={row.satisfaction === null ? "—" : `${row.satisfaction}%`}
            tone={row.satisfaction === null ? "default" : row.satisfaction >= 70 ? "brand" : "orange"}
            hint={t("votes", { up: row.up, down: row.down })}
          />
        ))}
      </div>
      <AdminSection>
        <AdminSearch
          filters={[
            { name: "context", label: t("allContexts"), options: result.summary.map((row) => ({ value: row.context, label: t(`contexts.${row.context}`) })) },
            { name: "rating", label: t("allRatings"), options: [{ value: "up", label: t("up") }, { value: "down", label: t("down") }] },
          ]}
        />
        <AdminTable head={[t("rating"), t("context"), t("comment"), t("user"), t("date")]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((f) => (
            <tr key={f.id}>
              <Cell>{f.rating === "up" ? <ThumbsUp className="size-5 text-brand" aria-label={t("up")} /> : <ThumbsDown className="size-5 text-danger" aria-label={t("down")} />}</Cell>
              <Cell className="whitespace-nowrap">{t(`contexts.${f.context}`)}</Cell>
              <Cell className="max-w-sm whitespace-pre-line">{f.comment ?? <span className="text-muted">—</span>}</Cell>
              <Cell>
                <UserCell user={f.user} />
              </Cell>
              <Cell className="whitespace-nowrap">{dateTime(f.createdAt, locale)}</Cell>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/admin/feedback" query={filter} />
      </AdminSection>
    </>
  );
}
