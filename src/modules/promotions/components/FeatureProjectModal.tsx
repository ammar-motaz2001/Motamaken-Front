"use client";

import { FileText, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { softSuccessClasses } from "@/components/ui/styles";
import { api } from "@/lib/api/client";
import type { Paginated, Project } from "@/lib/api/types";
import { formatAmount } from "@/lib/format";
import { PayModal } from "@/modules/payments";
import { PackagesStep } from "./PackagesStep";
import type { Promotion, PromotionPackage } from "./types";

const PER_PAGE = 3;

/** Feature-a-project flow: pick one of the user's open projects (searchable), choose a package, then pay. */
export function FeatureProjectModal({ open, onClose, currency }: { open: boolean; onClose: () => void; currency: string }) {
  const t = useTranslations("Promotions");
  const locale = useLocale();
  const [step, setStep] = useState<"select" | "packages" | "pay">("select");
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Project | null>(null);
  const [chosen, setChosen] = useState<PromotionPackage | null>(null);

  useEffect(() => {
    if (!open) return;
    api<Paginated<Project>>("/me/projects?status=open&perPage=50")
      .then(({ data }) => (setProjects(data), setFailed(false)))
      .catch(() => setFailed(true));
  }, [open]);

  const filtered = useMemo(
    () => (projects ?? []).filter((project) => project.title.toLowerCase().includes(query.trim().toLowerCase())),
    [projects, query],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const close = () => {
    setStep("select");
    setSelected(null);
    setChosen(null);
    setQuery("");
    setPage(1);
    onClose();
  };

  if (!open) return null;

  if (step === "pay" && selected && chosen) {
    return (
      <PayModal
        open
        onClose={close}
        amount={chosen.price}
        currency={chosen.currency}
        feedbackContext="promotion"
        rows={[
          { label: t("summary.package"), value: t(`packages.names.${chosen.code}`) },
          { label: t("summary.project"), value: selected.title },
          { label: t("summary.quantity"), value: 1 },
        ]}
        pay={async () => {
          const { data } = await api<{ data: Promotion }>("/promotions", {
            method: "POST",
            body: { kind: "project", projectId: selected.id, package: chosen.code, currency: chosen.currency },
          });
          return data.id;
        }}
        success={{
          message: t("success", { points: 200 }),
          actions: () => (
            <>
              <Button variant="outline" font="button" href="/settings/medals">
                {t("medals")}
              </Button>
              <Button variant="solid" font="button" href={`/projects/${selected.id}`}>
                {t("viewProject")}
              </Button>
            </>
          ),
        }}
        errorActions={() => (
          <>
            <Button variant="outlineOrange" font="button" href={`/projects/${selected.id}`}>
              {t("viewProject")}
            </Button>
            <Button variant="orange" font="button" href="/">
              {t("homepage")}
            </Button>
          </>
        )}
      />
    );
  }

  const title = (
    <span className="flex flex-col gap-1 text-start">
      {t(step === "select" ? "project.title" : "project.packagesTitle")}
      <span className="text-sm font-normal text-muted">{t("project.subtitle")}</span>
    </span>
  );

  if (step === "packages") {
    return (
      <Modal open onClose={close} showClose title={title}>
        <PackagesStep currency={currency} intro={t("project.intro")} onChoose={(item) => (setChosen(item), setStep("pay"))} />
      </Modal>
    );
  }

  return (
    <Modal open onClose={close} showClose title={title}>
      <div className="flex w-full flex-col gap-4 text-start">
        <label className="flex flex-col gap-2 text-sm font-bold">
          {t("project.select")}
          <span className="flex h-[42px] items-center gap-2 rounded-md border border-border px-3 font-normal focus-within:border-brand">
            <Search className="size-4 text-muted" aria-hidden />
            <input
              value={query}
              onChange={(event) => (setQuery(event.target.value), setPage(1))}
              placeholder={t("project.search")}
              className="min-w-0 flex-1 bg-transparent outline-none"
            />
          </span>
        </label>
        <Button variant="outline" font="button" href="/projects/new" className="self-center">
          {t("project.addNew")}
        </Button>

        {failed ? (
          <p role="alert" className="text-center text-sm text-danger">
            {t("project.loadFailed")}
          </p>
        ) : projects && !projects.length ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <FileText className="size-16 text-placeholder" strokeWidth={1} aria-hidden />
            <p className="max-w-md text-sm">{t("project.empty")}</p>
            <Button variant="solid" font="button" pill href="/projects/new">
              {t("project.addNew")}
            </Button>
          </div>
        ) : (
          <>
            <ul className="grid gap-3 sm:grid-cols-3">
              {visible.map((project) => (
                <li key={project.id}>
                  <button
                    type="button"
                    aria-pressed={selected?.id === project.id}
                    onClick={() => setSelected(project)}
                    className={`flex h-full w-full flex-col gap-2 rounded-xl border p-3 text-start transition-colors ${
                      selected?.id === project.id ? "border-brand bg-brand-soft" : "border-border hover:border-brand"
                    }`}
                  >
                    <span className="self-start rounded-md border border-brand-ink px-2 py-0.5 text-xs text-brand-ink">
                      {t("project.budget", {
                        min: formatAmount(project.budget.min, project.budget.currency, locale),
                        max: formatAmount(project.budget.max, project.budget.currency, locale),
                      })}
                    </span>
                    <span className="line-clamp-2 text-sm font-bold">{project.title}</span>
                    <span className="line-clamp-3 text-xs text-muted">{project.excerpt}</span>
                  </button>
                </li>
              ))}
              {!projects && !failed && [0, 1, 2].map((key) => <li key={key} className="h-36 animate-pulse rounded-xl bg-surface-muted" />)}
            </ul>
            {pages > 1 && (
              <div className="flex justify-center gap-1.5">
                {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
                  <button
                    key={number}
                    type="button"
                    aria-current={number === page ? "page" : undefined}
                    onClick={() => setPage(number)}
                    className={`size-8 rounded-md border text-sm ${number === page ? "border-brand text-brand" : "border-border"}`}
                  >
                    {number}
                  </button>
                ))}
              </div>
            )}
            {projects?.length && !filtered.length ? <p className="text-center text-sm text-muted">{t("project.noMatch")}</p> : null}
          </>
        )}

        {selected && (
          <p role="status" className={`${softSuccessClasses} p-2.5 text-center text-sm text-brand`}>
            {t("project.selected")}
          </p>
        )}

        <div className="flex justify-center gap-3">
          <Button variant="outline" font="button" onClick={close}>
            {t("close")}
          </Button>
          <Button variant="solid" font="button" disabled={!selected} onClick={() => setStep("packages")}>
            {t("next")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
