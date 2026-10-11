"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { outlinedPanelClasses, sectionTitleClasses } from "@/components/ui/styles";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError, FieldErrors } from "@/lib/api/errors";
import type { Paginated, ProfileCard } from "@/lib/api/types";

const SEARCH_DELAY_MS = 300;

export function InviteMemberForm({ teamId, maxShare, excludeIds }: { teamId: number; maxShare: number; excludeIds: number[] }) {
  const t = useTranslations("Teams.invite");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfileCard[]>([]);
  const [selected, setSelected] = useState<ProfileCard | null>(null);
  const [roleTitle, setRoleTitle] = useState("");
  const [share, setShare] = useState("10");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const term = query.trim();
    if (selected || term.length < 2) return;
    const timer = setTimeout(async () => {
      const result = await api<Paginated<ProfileCard>>(`/search?type=freelancers&perPage=6&q=${encodeURIComponent(term)}`).catch(
        () => null,
      );
      setResults(result?.data ?? []);
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [query, selected]);

  const options = results.filter((profile) => !excludeIds.includes(profile.userId));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected) {
      setErrors({ userId: t("pickFreelancer") });
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api(`/teams/${teamId}/members`, {
        method: "POST",
        body: { userId: selected.userId, roleTitle: roleTitle.trim() || null, sharePercent: Number(share) },
      });
      setSelected(null);
      setQuery("");
      setRoleTitle("");
      setShare("10");
      router.refresh();
    } catch (caught) {
      const apiError = caught as ApiError;
      setErrors(apiError.fields);
      setError(apiError.message || t("failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className={`${outlinedPanelClasses} flex flex-col gap-4`}>
      <h3 className={sectionTitleClasses}>{t("title")}</h3>
      {selected ? (
        <div className="flex items-center gap-3 rounded-lg border border-brand bg-brand-soft p-3">
          <UserAvatar name={selected.fullName} src={selected.avatarUrl} size={36} />
          <div className="me-auto">
            <p className="font-bold">{selected.fullName}</p>
            <p className="text-xs text-muted">{selected.jobTitle}</p>
          </div>
          <button type="button" aria-label={t("change")} onClick={() => setSelected(null)}>
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Field
            label={t("freelancer")}
            placeholder={t("searchPlaceholder")}
            value={query}
            error={errors.userId}
            trailing={<Search className="size-4 text-muted" />}
            onChange={(event) => {
              setQuery(event.target.value);
              setErrors({});
              if (event.target.value.trim().length < 2) setResults([]);
            }}
          />
          {options.length > 0 && (
            <ul className="absolute inset-x-0 top-full z-20 mt-1 rounded-lg border border-border bg-surface py-1 shadow-card">
              {options.map((profile) => (
                <li key={profile.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(profile);
                      setResults([]);
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-start hover:bg-surface-muted"
                  >
                    <UserAvatar name={profile.fullName} src={profile.avatarUrl} size={32} />
                    <span className="flex flex-col">
                      <span className="text-sm font-bold">{profile.fullName}</span>
                      <span className="text-xs text-muted">{profile.jobTitle}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t("role")}
          placeholder={t("rolePlaceholder")}
          maxLength={80}
          value={roleTitle}
          error={errors.roleTitle}
          onChange={(event) => setRoleTitle(event.target.value)}
        />
        <Field
          label={t("share")}
          type="number"
          min={1}
          max={maxShare}
          value={share}
          error={errors.sharePercent}
          hint={t("shareHint", { max: maxShare })}
          onChange={(event) => setShare(event.target.value)}
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex flex-col items-start gap-2">
        <Button type="submit" variant="solid" pill loading={saving} disabled={maxShare < 1}>
          {t("send")}
        </Button>
        <p className="text-xs text-muted">{t("note")}</p>
      </div>
    </form>
  );
}
