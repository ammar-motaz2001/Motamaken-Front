"use client";

import { CircleCheck, Laptop, ShieldCheck, ShieldOff } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { ResultModal } from "@/components/ui/ResultModal";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import { deleteSession } from "@/modules/auth/actions";
import { SettingsPanel } from "./SettingsPanel";
import { TwoFactorModal, type SecurityState } from "./TwoFactorModal";

/** Two-factor status with turn on/off, and the list of signed-in devices to log out one by one or all others. */
export function SecuritySettings({ initial, email, phone }: { initial: SecurityState; email: string | null; phone: string | null }) {
  const t = useTranslations("Settings.security");
  const format = useFormatter();
  const router = useRouter();
  const [state, setState] = useState(initial);
  const [enabling, setEnabling] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<"off" | "offFailed" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const { twoFactor } = state;

  const reload = async () => setState(await api<SecurityState>("/me/security"));

  const disable = async () => {
    setBusy("disable");
    setError(null);
    try {
      setState(await api<SecurityState>("/me/two-factor/disable", { method: "POST", body: { password } }));
      setDisabling(false);
      setPassword("");
      setResult("off");
    } catch (caught) {
      const apiError = caught as ApiError;
      if (apiError.fields.password) {
        setError(apiError.fields.password);
      } else {
        setDisabling(false);
        setResult("offFailed");
      }
    } finally {
      setBusy(null);
    }
  };

  const logout = async (id: number | "others") => {
    setBusy(String(id));
    const response = await api<{ wasCurrent?: boolean }>(id === "others" ? "/me/sessions/logout-others" : `/me/sessions/${id}`, {
      method: id === "others" ? "POST" : "DELETE",
    }).catch(() => null);
    setBusy(null);
    if (response?.wasCurrent) {
      startTransition(async () => {
        await deleteSession();
        router.replace("/login");
        router.refresh();
      });
      return;
    }
    await reload();
  };

  return (
    <SettingsPanel title={t("title")} subtitle={t("subtitle")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-1 flex-col gap-2">
          <h3 className="text-sm font-bold">{t("twoFactor")}</h3>
          {!twoFactor.enabled && <p className="text-sm text-orange">{t("notEnabled")}</p>}
          <p className="text-sm text-muted">{t("twoFactorText")}</p>
          {twoFactor.enabled ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-sm font-medium text-brand">
                <CircleCheck className="size-4" />
                {t("enabledVia", { method: t(`via.${twoFactor.method}`), target: twoFactor.target ?? "" })}
              </span>
              <button type="button" onClick={() => setDisabling(true)} className="rounded-md border border-orange px-3 py-1 text-xs font-medium text-orange hover:bg-orange/10">
                {t("turnOff")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEnabling(true)}
              className="self-start rounded-md border border-brand px-4 py-1.5 text-sm font-medium text-brand hover:bg-brand-soft"
            >
              {t("enableButton")} →
            </button>
          )}
        </div>
        {twoFactor.enabled ? (
          <ShieldCheck className="size-24 shrink-0 self-center text-brand" strokeWidth={1} aria-hidden />
        ) : (
          <ShieldOff className="size-24 shrink-0 self-center text-placeholder" strokeWidth={1} aria-hidden />
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold">{t("devices")}</h3>
            <p className="text-xs text-muted">{t("devicesText")}</p>
          </div>
          {state.sessions.length > 1 && (
            <Button variant="outlineOrange" font="button" loading={busy === "others"} onClick={() => logout("others")}>
              {t("logoutOthers")}
            </Button>
          )}
        </div>
        <ul className="flex flex-col divide-y divide-border">
          {state.sessions.map((session) => (
            <li key={session.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
              <Laptop className="size-5 shrink-0 text-muted" aria-hidden />
              <span className="me-auto">
                <span className="block font-medium">
                  {session.device}
                  {session.ip && <span className="text-muted"> · {session.ip}</span>}
                  {session.isCurrent && <span className="ms-2 rounded-full bg-brand-soft px-2 py-0.5 text-xs text-brand">{t("thisDevice")}</span>}
                </span>
                <span className="block text-xs text-muted">
                  {t("lastLogin", { date: format.dateTime(new Date(session.lastUsedAt), { dateStyle: "medium", timeStyle: "short" }) })}
                </span>
              </span>
              <button type="button" disabled={busy === String(session.id)} onClick={() => logout(session.id)} className="text-xs font-bold text-danger hover:underline disabled:opacity-50">
                {t("logout")}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <TwoFactorModal open={enabling} onClose={() => setEnabling(false)} onEnabled={setState} email={email} phone={phone} />

      <Modal open={disabling} onClose={() => (setDisabling(false), setError(null))} showClose title={t("turnOffTitle")}>
        <div className="flex w-full flex-col gap-4 text-start">
          <p className="text-sm">{t("turnOffConfirm")}</p>
          <PasswordField label={t("password")} autoComplete="current-password" value={password} error={error ?? undefined} onChange={(event) => (setPassword(event.target.value), setError(null))} />
          <div className="flex justify-center gap-3">
            <Button variant="solid" font="button" onClick={() => setDisabling(false)}>
              {t("keepOn")}
            </Button>
            <Button variant="outlineOrange" font="button" loading={busy === "disable"} disabled={!password} onClick={disable}>
              {t("turnOff")}
            </Button>
          </div>
        </div>
      </Modal>

      <ResultModal
        open={Boolean(result)}
        onClose={() => setResult(null)}
        type={result === "off" ? "success" : "error"}
        title={<span className="text-start">{t("turnOffTitle")}</span>}
        message={t(result === "off" ? "turnedOff" : "failed")}
      >
        <Button variant={result === "off" ? "primary" : "outlineOrange"} font="button" onClick={() => setResult(null)}>
          {t("backToSecurity")}
        </Button>
      </ResultModal>
    </SettingsPanel>
  );
}
