"use client";

import { FolderKanban, Megaphone, Search, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { api } from "@/lib/api/client";
import type { SearchAll } from "@/lib/api/types";

export type Suggestion = { key: string; label: string; hint: string; href: string; kind: "person" | "project" | "request"; avatar?: string | null };

const MIN_LENGTH = 2;
const PER_GROUP = 3;

/** Suggestions for the header search while typing: people by name or job title, projects and requests by title. */
export function useSearchSuggestions(query: string) {
  const t = useTranslations("Header.suggest");
  const term = query.trim();
  const [result, setResult] = useState<{ term: string; items: Suggestion[] } | null>(null);

  useEffect(() => {
    if (term.length < MIN_LENGTH) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      api<SearchAll>(`/search?q=${encodeURIComponent(term)}`)
        .then((data) => {
          if (cancelled) return;
          const people = [...data.freelancers, ...data.influencers].slice(0, PER_GROUP * 2).map<Suggestion>((profile) => ({
            key: `user-${profile.userId}`,
            label: profile.fullName,
            hint: profile.jobTitle ?? t(profile.type),
            href: `/users/${profile.userId}`,
            kind: "person",
            avatar: profile.avatarUrl,
          }));
          const projects = data.projects.slice(0, PER_GROUP).map<Suggestion>((project) => ({
            key: `project-${project.id}`,
            label: project.title,
            hint: project.category.name,
            href: `/projects/${project.id}`,
            kind: "project",
          }));
          const requests = data.influencerRequests.slice(0, PER_GROUP).map<Suggestion>((project) => ({
            key: `request-${project.id}`,
            label: project.title,
            hint: project.category.name,
            href: `/projects/${project.id}`,
            kind: "request",
          }));
          setResult({ term, items: [...people, ...projects, ...requests] });
        })
        .catch(() => !cancelled && setResult({ term, items: [] }));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term, t]);

  const ready = term.length >= MIN_LENGTH;
  return { items: ready && result?.term === term ? result.items : [], loading: ready && result?.term !== term, ready };
}

const ICONS = { project: FolderKanban, request: Megaphone, person: UserRound };

type SuggestionListProps = {
  id: string;
  query: string;
  items: Suggestion[];
  loading: boolean;
  active: number;
  onHover: (index: number) => void;
  onPick: (href: string) => void;
};

/** The suggestion popover: the typed words highlighted, then "see all results" as the last row. */
export function SuggestionList({ id, query, items, loading, active, onHover, onPick }: SuggestionListProps) {
  const t = useTranslations("Header.suggest");
  const term = query.trim();
  const highlight = (text: string) => {
    const at = text.toLowerCase().indexOf(term.toLowerCase());
    if (at < 0) return text;
    return (
      <>
        {text.slice(0, at)}
        <mark className="bg-transparent font-bold text-brand">{text.slice(at, at + term.length)}</mark>
        {text.slice(at + term.length)}
      </>
    );
  };

  return (
    <ul id={id} role="listbox" className="glass pop-down absolute inset-x-0 top-full z-50 mt-2 max-h-[min(420px,70vh)] overflow-y-auto rounded-xl border border-border py-1.5 shadow-card">
      {items.map((item, index) => {
        const Icon = ICONS[item.kind];
        return (
          <li key={item.key} id={`${id}-${index}`} role="option" aria-selected={index === active}>
            <button
              type="button"
              onMouseEnter={() => onHover(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onPick(item.href)}
              className={`flex w-full items-center gap-3 px-3 py-2 text-start transition-colors ${index === active ? "bg-brand/10" : ""}`}
            >
              {item.kind === "person" ? (
                <UserAvatar name={item.label} src={item.avatar ?? null} size={30} />
              ) : (
                <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-orange/10 text-orange">
                  <Icon className="size-4" aria-hidden />
                </span>
              )}
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm">{highlight(item.label)}</span>
                <span className="truncate text-xs text-muted">{item.hint}</span>
              </span>
            </button>
          </li>
        );
      })}
      {loading && !items.length && <li className="px-3 py-2.5 text-sm text-muted">{t("loading")}</li>}
      {!loading && !items.length && <li className="px-3 py-2.5 text-sm text-muted">{t("none")}</li>}
      <li id={`${id}-${items.length}`} role="option" aria-selected={active === items.length} className="border-t border-border">
        <button
          type="button"
          onMouseEnter={() => onHover(items.length)}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onPick("")}
          className={`flex w-full items-center gap-2 px-3 py-2.5 text-start text-sm font-medium text-brand ${active === items.length ? "bg-brand/10" : ""}`}
        >
          <Search className="size-4" aria-hidden />
          {t("all", { q: term })}
        </button>
      </li>
    </ul>
  );
}
