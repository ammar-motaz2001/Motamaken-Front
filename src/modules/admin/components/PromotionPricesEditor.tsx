"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import type { PromotionPrices } from "../types";
import { inputClasses } from "./ActionButton";
import { SaveBar, TextInput } from "./FormBits";
import { useAdminSave } from "./useAdminSave";

type Package = PromotionPrices["packages"][number];

/** Prices of paid placements: per day per currency, the ready-made packages, and the points given per purchase. */
export function PromotionPricesEditor({ initial, currencies, readOnly }: { initial: PromotionPrices; currencies: string[]; readOnly?: boolean }) {
  const t = useTranslations("Admin.promotions");
  const { busy, error, fields, saved, save } = useAdminSave();
  const [prices, setPrices] = useState(() =>
    Object.fromEntries(["profile", "project"].map((kind) => [kind, Object.fromEntries(currencies.map((c) => [c, String(initial.prices[kind]?.[c] ?? "")]))])),
  );
  const [packages, setPackages] = useState<(Omit<Package, "prices" | "reach"> & { reach: [string, string]; prices: Record<string, string> })[]>(() =>
    initial.packages.map((p) => ({ ...p, reach: [String(p.reach[0]), String(p.reach[1])], prices: Object.fromEntries(currencies.map((c) => [c, String(p.prices[c] ?? "")])) })),
  );
  const [points, setPoints] = useState(String(initial.points));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const num = (v: string) => Number(v || 0);
    await save("/admin/promotions/prices", "PUT", {
      prices: Object.fromEntries(Object.entries(prices).map(([kind, row]) => [kind, Object.fromEntries(Object.entries(row).filter(([, v]) => v !== "").map(([c, v]) => [c, num(v)]))])),
      packages: packages.map((p) => ({
        code: p.code,
        days: num(String(p.days)),
        reach: [num(p.reach[0]), num(p.reach[1])],
        prices: Object.fromEntries(Object.entries(p.prices).filter(([, v]) => v !== "").map(([c, v]) => [c, num(v)])),
      })),
      points: num(points),
    });
  };

  const setPackage = (index: number, change: Partial<(typeof packages)[number]>) => setPackages((list) => list.map((p, i) => (i === index ? { ...p, ...change } : p)));

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <fieldset disabled={readOnly} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">{t("perDay")}</p>
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="text-xs text-muted">
                  <th className="px-2 py-1.5 text-start">{t("placement")}</th>
                  {currencies.map((c) => (
                    <th key={c} className="px-2 py-1.5 text-start">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(["profile", "project"] as const).map((kind) => (
                  <tr key={kind}>
                    <td className="px-2 py-1.5 font-medium">{t(`kinds.${kind}`)}</td>
                    {currencies.map((c) => (
                      <td key={c} className="px-2 py-1.5">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          aria-label={`${t(`kinds.${kind}`)} ${c}`}
                          value={prices[kind][c]}
                          onChange={(e) => setPrices((all) => ({ ...all, [kind]: { ...all[kind], [c]: e.target.value } }))}
                          className={inputClasses}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">{t("packages")}</p>
          {packages.map((p, index) => (
            <div key={index} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[8rem_5rem_1fr_auto]">
              <TextInput label={t("code")} value={p.code} onChange={(code) => setPackage(index, { code })} dir="ltr" error={fields[`packages.${index}.code`]} />
              <TextInput label={t("days")} type="number" value={String(p.days)} onChange={(days) => setPackage(index, { days: Number(days) })} />
              <div className="grid grid-cols-2 gap-2">
                <TextInput label={t("reachFrom")} type="number" value={p.reach[0]} onChange={(v) => setPackage(index, { reach: [v, p.reach[1]] })} />
                <TextInput label={t("reachTo")} type="number" value={p.reach[1]} onChange={(v) => setPackage(index, { reach: [p.reach[0], v] })} />
              </div>
              <button type="button" onClick={() => setPackages((list) => list.filter((_, i) => i !== index))} disabled={packages.length === 1} aria-label={t("removePackage")} className="flex size-9 items-center justify-center self-end rounded-md text-danger hover:bg-danger-soft disabled:opacity-30">
                <Trash2 className="size-4" />
              </button>
              <div className="grid grid-cols-2 gap-2 sm:col-span-4 sm:grid-cols-4">
                {currencies.map((c) => (
                  <TextInput key={c} label={c} type="number" step="0.01" value={p.prices[c] ?? ""} onChange={(v) => setPackage(index, { prices: { ...p.prices, [c]: v } })} />
                ))}
              </div>
            </div>
          ))}
          {packages.length < 6 && (
            <button
              type="button"
              onClick={() => setPackages((list) => [...list, { code: `pack${list.length + 1}`, days: 1, reach: ["0", "0"], prices: Object.fromEntries(currencies.map((c) => [c, ""])) }])}
              className="flex items-center gap-1.5 self-start text-sm text-link hover:underline"
            >
              <Plus className="size-4" /> {t("addPackage")}
            </button>
          )}
        </div>

        <TextInput label={t("points")} hint={t("pointsHint")} type="number" value={points} onChange={setPoints} className="max-w-xs" />
      </fieldset>
      {!readOnly && <SaveBar busy={busy} error={error} saved={saved} />}
    </form>
  );
}
