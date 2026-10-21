import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { StatusPill } from "@/components/ui/StatusPill";
import { getCurrencies } from "@/lib/api/reference";
import { apiGet } from "@/lib/api/server";
import { ActionButton, AdminHeader, AdminSection, AdminTable, Cell, DrawForm, dateTime, money, toneFor, type AdminDraw } from "@/modules/admin";

/** Admin › Draws: create prize draws and run them to pick winners, from GET /admin/draws. */
export default async function AdminDraws({ params }: PageProps<"/[locale]/admin/draws">) {
  setRequestLocale((await params).locale);
  const [t, locale, currencies, result] = await Promise.all([
    getTranslations("Admin.draws"),
    getLocale(),
    getCurrencies(),
    apiGet<{ data: AdminDraw[] }>("/admin/draws"),
  ]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      <DrawForm currencies={currencies.map((c) => c.code)} />
      <AdminSection>
        <AdminTable head={[t("draw"), t("prizes"), t("tickets"), t("drawAt"), t("state"), ""]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((draw) => (
            <tr key={draw.id}>
              <Cell>
                <div className="font-medium">{locale === "ar" ? draw.title_ar : draw.title_en}</div>
                <div className="text-xs text-muted">{t("cost", { points: draw.ticket_cost })}</div>
              </Cell>
              <Cell>
                <ul className="flex flex-col gap-0.5 text-xs">
                  {draw.prizes.map((prize) => (
                    <li key={prize.rank}>
                      #{prize.rank} {locale === "ar" ? prize.name_ar : prize.name_en}
                      {prize.value !== null && prize.currency && <span className="text-muted"> · {money(prize.value, prize.currency, locale)}</span>}
                    </li>
                  ))}
                </ul>
              </Cell>
              <Cell>
                <div>{draw.entries_sum_tickets ?? 0}</div>
                <div className="text-xs text-muted">{t("players", { count: draw.entries_count })}</div>
              </Cell>
              <Cell className="whitespace-nowrap">{dateTime(draw.draw_at, locale)}</Cell>
              <Cell>
                <StatusPill tone={toneFor(draw.status)}>{t(`status.${draw.status}`)}</StatusPill>
              </Cell>
              <Cell className="text-end">
                {draw.status === "open" && <ActionButton label={t("run")} endpoint={`/admin/draws/${draw.id}/run`} tone="orange" confirm={t("confirmRun")} />}
              </Cell>
            </tr>
          ))}
        </AdminTable>
      </AdminSection>
    </>
  );
}
