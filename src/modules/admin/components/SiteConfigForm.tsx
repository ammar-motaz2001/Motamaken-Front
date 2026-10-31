"use client";

import { confirmDialog } from "@/components/ui/ConfirmDialog";
import { ArrowDown, ArrowUp, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState, type FormEvent } from "react";
import { DateField } from "@/components/ui/DatePicker";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { FooterColumn } from "@/lib/api/types";
import type { SiteConfig } from "../types";
import { inputClasses } from "./ActionButton";
import { FooterLinksEditor } from "./FooterLinksEditor";
import { LabeledInput, SaveBar, TextInput } from "./FormBits";
import { useAdminSave } from "./useAdminSave";

/** Everything under "Site settings": identity, links, footer, apps, maintenance, uploads, staff policy and payment methods. */
export function SiteConfigForm({ config, defaultFooter }: { config: SiteConfig; defaultFooter: FooterColumn[] }) {
  const t = useTranslations("Admin.siteSettings");
  const router = useRouter();
  const { busy, error, fields, saved, save } = useAdminSave();
  const logoInput = useRef<HTMLInputElement>(null);
  const [site, setSite] = useState(() => Object.fromEntries(Object.entries(config.site).map(([k, v]) => [k, v ?? ""])) as Record<string, string>);
  const [social, setSocial] = useState(() => Object.fromEntries(config.choices.social.map((k) => [k, config.social[k] ?? ""])) as Record<string, string>);
  const [apps, setApps] = useState({ android: config.apps.android ?? "", ios: config.apps.ios ?? "" });
  const [footer, setFooter] = useState<FooterColumn[] | null>(config.footer);
  const [maintenance, setMaintenance] = useState({ ...config.maintenance, endsAt: config.maintenance.endsAt ?? "" });
  const [uploads, setUploads] = useState({ ...config.uploads });
  const [seo, setSeo] = useState({ descriptionEn: config.seo?.descriptionEn ?? "", descriptionAr: config.seo?.descriptionAr ?? "" });
  const [security, setSecurity] = useState(config.security);
  const [deposits, setDeposits] = useState(config.payments.depositMethods);
  const [withdrawals, setWithdrawals] = useState(config.payments.withdrawalMethods);
  const [logoBusy, setLogoBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (maintenance.enabled && !config.maintenance.enabled && !(await confirmDialog(t("confirmMaintenance")))) return;
    const { logoUrl: _logo, ...siteFields } = site;
    void _logo;
    await save("/admin/site-settings", "PUT", {
      site: Object.fromEntries(Object.entries(siteFields).map(([k, v]) => [k, v || null])),
      social: Object.fromEntries(Object.entries(social).map(([k, v]) => [k, v || null])),
      apps: { android: apps.android || null, ios: apps.ios || null },
      footer: footer?.map((column) => ({
        titleEn: column.titleEn.trim(),
        titleAr: column.titleAr.trim(),
        links: column.links.map((link) => ({ labelEn: link.labelEn.trim(), labelAr: link.labelAr.trim(), href: link.href.trim() })),
      })) ?? null,
      maintenance: { ...maintenance, endsAt: maintenance.endsAt || null },
      uploads: { ...uploads, avatarMb: Number(uploads.avatarMb), portfolioMb: Number(uploads.portfolioMb), documentMb: Number(uploads.documentMb), chatMb: Number(uploads.chatMb) },
      seo: { descriptionEn: seo.descriptionEn.trim() || null, descriptionAr: seo.descriptionAr.trim() || null },
      security,
      payments: { depositMethods: deposits, withdrawalMethods: withdrawals },
    });
  };

  const uploadLogo = async (file: File | null, remove = false) => {
    setLogoBusy(true);
    const form = new FormData();
    if (file) form.append("logo", file);
    if (remove) form.append("remove", "1");
    try {
      const { data } = await api<{ data: { logoUrl: string | null } }>("/admin/site-settings/logo", { method: "POST", body: form });
      setSite((s) => ({ ...s, logoUrl: data.logoUrl ?? "" }));
      router.refresh();
    } finally {
      setLogoBusy(false);
    }
  };

  const methodList = (all: string[], chosen: string[], setChosen: (v: string[]) => void, prefix: string) => (
    <ul className="flex flex-col gap-1.5">
      {[...chosen, ...all.filter((m) => !chosen.includes(m))].map((method) => {
        const index = chosen.indexOf(method);
        const on = index >= 0;
        return (
          <li key={method} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={on}
                onChange={() => setChosen(on ? chosen.filter((m) => m !== method) : [...chosen, method])}
                className="size-4 accent-brand"
              />
              {t(`${prefix}.${method}`)}
            </label>
            {on && (
              <span className="flex gap-1">
                <button type="button" disabled={index === 0} onClick={() => setChosen(chosen.map((m, i) => (i === index - 1 ? method : i === index ? chosen[index - 1] : m)))} aria-label={t("moveUp")} className="flex size-7 items-center justify-center rounded border border-border disabled:opacity-30">
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === chosen.length - 1}
                  onClick={() => setChosen(chosen.map((m, i) => (i === index + 1 ? method : i === index ? chosen[index + 1] : m)))}
                  aria-label={t("moveDown")}
                  className="flex size-7 items-center justify-center rounded border border-border disabled:opacity-30"
                >
                  <ArrowDown className="size-3.5" />
                </button>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );

  const section = "flex flex-col gap-3 rounded-xl border border-border p-4";

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <fieldset className={section}>
        <legend className="px-1 font-bold">{t("identity")}</legend>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-40 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-muted">
            {/* eslint-disable-next-line @next/next/no-img-element -- uploaded logo from the API */}
            {site.logoUrl ? <img src={site.logoUrl} alt={t("logo")} className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-muted">{t("defaultLogo")}</span>}
          </div>
          <input ref={logoInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => uploadLogo(e.target.files?.[0] ?? null)} />
          <button type="button" disabled={logoBusy} onClick={() => logoInput.current?.click()} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-semibold hover:border-brand disabled:opacity-50">
            <Upload className="size-4" /> {t("uploadLogo")}
          </button>
          {site.logoUrl && (
            <button type="button" disabled={logoBusy} onClick={() => uploadLogo(null, true)} className="text-sm text-danger hover:underline">
              {t("removeLogo")}
            </button>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {(["nameEn", "nameAr", "taglineEn", "taglineAr", "email", "phone", "whatsapp", "addressEn", "addressAr"] as const).map((key) => (
            <TextInput key={key} label={t(`fields.${key}`)} dir={key.endsWith("Ar") ? "rtl" : key === "email" || key === "phone" || key === "whatsapp" ? "ltr" : undefined} value={site[key] ?? ""} onChange={(v) => setSite((s) => ({ ...s, [key]: v }))} error={fields[`site.${key}`]} />
          ))}
        </div>
      </fieldset>

      <fieldset className={section}>
        <legend className="px-1 font-bold">{t("socialLinks")}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {config.choices.social.map((key) => (
            <TextInput key={key} label={t(`social.${key}`)} dir="ltr" value={social[key]} onChange={(v) => setSocial((s) => ({ ...s, [key]: v }))} error={fields[`social.${key}`]} />
          ))}
        </div>
      </fieldset>

      <fieldset className={section}>
        <legend className="px-1 font-bold">{t("footer.title")}</legend>
        <FooterLinksEditor value={footer} onChange={setFooter} defaults={defaultFooter} errors={fields} />
      </fieldset>

      <fieldset className={section}>
        <legend className="px-1 font-bold">{t("apps")}</legend>
        <p className="text-xs text-muted">{t("appsHint")}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput label={t("android")} dir="ltr" value={apps.android} onChange={(v) => setApps((a) => ({ ...a, android: v }))} error={fields["apps.android"]} />
          <TextInput label={t("ios")} dir="ltr" value={apps.ios} onChange={(v) => setApps((a) => ({ ...a, ios: v }))} error={fields["apps.ios"]} />
        </div>
      </fieldset>

      <fieldset className={`${section} ${maintenance.enabled ? "border-orange bg-orange/5" : ""}`}>
        <legend className="px-1 font-bold">{t("maintenance")}</legend>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={maintenance.enabled} onChange={(e) => setMaintenance((m) => ({ ...m, enabled: e.target.checked }))} className="size-4 accent-orange" />
          {t("maintenanceOn")}
        </label>
        <p className="text-xs text-muted">{t("maintenanceHint")}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <LabeledInput label={t("messageEn")}>
            {(id) => <textarea id={id} dir="ltr" rows={2} value={maintenance.messageEn} onChange={(e) => setMaintenance((m) => ({ ...m, messageEn: e.target.value }))} className={inputClasses} />}
          </LabeledInput>
          <LabeledInput label={t("messageAr")}>
            {(id) => <textarea id={id} dir="rtl" rows={2} value={maintenance.messageAr} onChange={(e) => setMaintenance((m) => ({ ...m, messageAr: e.target.value }))} className={inputClasses} />}
          </LabeledInput>
          <DateField withTime label={t("endsAt")} hint={t("endsAtHint")} value={maintenance.endsAt ? maintenance.endsAt.slice(0, 16) : ""} onChange={(v) => setMaintenance((m) => ({ ...m, endsAt: v }))} />
        </div>
      </fieldset>

      <fieldset className={section}>
        <legend className="px-1 font-bold">{t("seo")}</legend>
        <p className="text-xs text-muted">{t("seoHint")}</p>
        <div className="grid gap-3 md:grid-cols-2">
          <LabeledInput label={t("seoDescriptionEn")} hint={`${seo.descriptionEn.length}/170`} error={fields["seo.descriptionEn"]}>
            {(id) => <textarea id={id} dir="ltr" rows={3} maxLength={170} value={seo.descriptionEn} onChange={(e) => setSeo((s) => ({ ...s, descriptionEn: e.target.value }))} className={inputClasses} />}
          </LabeledInput>
          <LabeledInput label={t("seoDescriptionAr")} hint={`${seo.descriptionAr.length}/170`} error={fields["seo.descriptionAr"]}>
            {(id) => <textarea id={id} dir="rtl" rows={3} maxLength={170} value={seo.descriptionAr} onChange={(e) => setSeo((s) => ({ ...s, descriptionAr: e.target.value }))} className={inputClasses} />}
          </LabeledInput>
        </div>
      </fieldset>

      <fieldset className={section}>
        <legend className="px-1 font-bold">{t("uploads")}</legend>
        <div className="grid gap-3 sm:grid-cols-4">
          {(["avatarMb", "portfolioMb", "documentMb", "chatMb"] as const).map((key) => (
            <TextInput key={key} label={t(`limits.${key}`)} type="number" value={String(uploads[key])} onChange={(v) => setUploads((u) => ({ ...u, [key]: Number(v) }))} error={fields[`uploads.${key}`]} />
          ))}
        </div>
        <p className="text-sm font-medium">{t("attachmentTypes")}</p>
        <div className="flex flex-wrap gap-2">
          {config.choices.attachmentTypes.map((type) => (
            <label key={type} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs has-checked:border-brand has-checked:bg-brand/10">
              <input
                type="checkbox"
                checked={uploads.attachmentTypes.includes(type)}
                onChange={() => setUploads((u) => ({ ...u, attachmentTypes: u.attachmentTypes.includes(type) ? u.attachmentTypes.filter((x) => x !== type) : [...u.attachmentTypes, type] }))}
                className="size-3.5 accent-brand"
              />
              .{type}
            </label>
          ))}
        </div>
        <p className="text-xs text-muted">{t("attachmentHint")}</p>
      </fieldset>

      <fieldset className={section}>
        <legend className="px-1 font-bold">{t("payments")}</legend>
        <p className="text-xs text-muted">{t("paymentsHint")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">{t("depositMethods")}</p>
            {methodList(config.choices.depositMethods, deposits, setDeposits, "methods")}
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">{t("withdrawalMethods")}</p>
            {methodList(config.choices.withdrawalMethods, withdrawals, setWithdrawals, "methods")}
          </div>
        </div>
      </fieldset>

      <fieldset className={section}>
        <legend className="px-1 font-bold">{t("staffPolicy")}</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={security.requireAdmin2fa} onChange={(e) => setSecurity((current) => ({ ...current, requireAdmin2fa: e.target.checked }))} className="size-4 accent-brand" />
          {t("require2fa")}
        </label>
        <p className="text-xs text-muted">{t("require2faHint")}</p>
      </fieldset>

      <fieldset className={section}>
        <legend className="px-1 font-bold">{t("chatPolicy")}</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={Boolean(security.ownersWriteFirst)} onChange={(e) => setSecurity((current) => ({ ...current, ownersWriteFirst: e.target.checked }))} className="size-4 accent-brand" />
          {t("ownersWriteFirst")}
        </label>
        <p className="text-xs text-muted">{t("ownersWriteFirstHint")}</p>
      </fieldset>

      <SaveBar busy={busy} error={error} saved={saved} />
    </form>
  );
}
