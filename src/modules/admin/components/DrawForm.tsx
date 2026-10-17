"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { inputClasses } from "./ActionButton";
import { SaveBar, TextInput } from "./FormBits";
import { Listbox } from "@/components/ui/Listbox";
import { DateField } from "@/components/ui/DatePicker";
import { useAdminSave } from "./useAdminSave";

type Prize = { nameEn: string; nameAr: string; kind: "cash" | "item"; value: string; currency: string };

const localInput = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export function DrawForm({ currencies }: { currencies: string[] }) {
  const t = useTranslations("Admin.draws");
  const { busy, error, fields, saved, save } = useAdminSave();
  const [open, setOpen] = useState(false);
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [ticketCost, setTicketCost] = useState("10");
  const [maxTickets, setMaxTickets] = useState("");
  const [startsAt, setStartsAt] = useState(() => localInput(new Date()));
  const [drawAt, setDrawAt] = useState(() => localInput(new Date(Date.now() + 7 * 864e5)));
  const [prizes, setPrizes] = useState<Prize[]>([{ nameEn: "", nameAr: "", kind: "cash", value: "", currency: currencies[0] ?? "USD" }]);

  const setPrize = (index: number, change: Partial<Prize>) => setPrizes((current) => current.map((prize, i) => (i === index ? { ...prize, ...change } : prize)));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await save("/admin/draws", "POST", {
      titleEn,
      titleAr,
      ticketCost: Number(ticketCost),
      maxTicketsPerUser: maxTickets ? Number(maxTickets) : null,
      startsAt: new Date(startsAt).toISOString(),
      drawAt: new Date(drawAt).toISOString(),
      prizes: prizes.map((prize, index) => ({ ...prize, rank: index + 1, value: Number(prize.value || 0) })),
    });
    if (result) setOpen(false);
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-10 items-center gap-1.5 self-end rounded-md bg-brand px-4 text-sm font-semibold text-white">
        <Plus className="size-4" /> {t("new")}
      </button>
    );
  }

  const prizeError = Object.entries(fields).find(([key]) => key.startsWith("prizes"))?.[1];

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-xl border border-brand/40 bg-brand/5 p-4">
      <p className="font-bold">{t("new")}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextInput label={t("titleEn")} dir="ltr" value={titleEn} onChange={setTitleEn} error={fields.titleEn} required />
        <TextInput label={t("titleAr")} dir="rtl" value={titleAr} onChange={setTitleAr} error={fields.titleAr} required />
        <TextInput label={t("ticketCost")} hint={t("ticketCostHint")} type="number" value={ticketCost} onChange={setTicketCost} error={fields.ticketCost} required />
        <TextInput label={t("maxTickets")} hint={t("maxTicketsHint")} type="number" value={maxTickets} onChange={setMaxTickets} error={fields.maxTicketsPerUser} />
        <DateField withTime label={t("startsAt")} value={startsAt} onChange={setStartsAt} error={fields.startsAt} required />
        <DateField withTime label={t("drawAt")} value={drawAt} onChange={setDrawAt} error={fields.drawAt} required min={startsAt.slice(0, 10)} />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">{t("prizes")}</p>
        {prizes.map((prize, index) => (
          <div key={index} className="grid items-center gap-2 rounded-lg border border-border bg-surface p-3 sm:grid-cols-[auto_1fr_1fr_110px_110px_90px_auto]">
            <span className="text-sm font-bold text-orange">#{index + 1}</span>
            <input aria-label={t("prizeNameEn")} placeholder={t("prizeNameEn")} dir="ltr" required value={prize.nameEn} onChange={(e) => setPrize(index, { nameEn: e.target.value })} className={inputClasses} />
            <input aria-label={t("prizeNameAr")} placeholder={t("prizeNameAr")} dir="rtl" required value={prize.nameAr} onChange={(e) => setPrize(index, { nameAr: e.target.value })} className={inputClasses} />
            <Listbox
              aria-label={t("kind")}
              value={prize.kind}
              onChange={(value) => setPrize(index, { kind: value as Prize["kind"] })}
              options={[
                { value: "cash", label: t("kinds.cash") },
                { value: "item", label: t("kinds.item") },
              ]}
            />
            <input aria-label={t("value")} placeholder={t("value")} type="number" step="0.01" required value={prize.value} onChange={(e) => setPrize(index, { value: e.target.value })} className={inputClasses} />
            <Listbox aria-label={t("currency")} value={prize.currency} onChange={(value) => setPrize(index, { currency: value })} options={currencies.map((code) => ({ value: code, label: code }))} />
            <button
              type="button"
              aria-label={t("removePrize")}
              disabled={prizes.length === 1}
              onClick={() => setPrizes((current) => current.filter((_, i) => i !== index))}
              className="flex size-9 items-center justify-center rounded-md text-danger hover:bg-danger-soft disabled:opacity-30"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        {prizeError && <p className="text-xs text-danger">{prizeError}</p>}
        {prizes.length < 10 && (
          <button
            type="button"
            onClick={() => setPrizes((current) => [...current, { nameEn: "", nameAr: "", kind: "item", value: "", currency: currencies[0] ?? "USD" }])}
            className="self-start text-sm text-link hover:underline"
          >
            + {t("addPrize")}
          </button>
        )}
      </div>
      <SaveBar
        busy={busy}
        error={error}
        saved={saved}
        label={t("create")}
        extra={
          <button type="button" onClick={() => setOpen(false)} className="h-10 rounded-md border border-border bg-surface px-4 text-sm font-semibold">
            {t("cancel")}
          </button>
        }
      />
    </form>
  );
}
