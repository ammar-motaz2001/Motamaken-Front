"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { Category, Paginated, Project, ProjectType } from "@/lib/api/types";
import { ProjectCard } from "@/components/cards/ProjectCard";

const PAGE_SIZE = 5;
const VISIBLE_TABS = 5;

type TabState = { projects: Project[]; page: number; lastPage: number };

type ProjectTabsProps = {
  title: string;
  type: ProjectType;
  categories: Category[];
  initial: Project[];
  showSeeMore?: boolean;
};

export function ProjectTabs({ title, type, categories, initial, showSeeMore }: ProjectTabsProps) {
  const t = useTranslations("Home");
  const [active, setActive] = useState(categories[0]?.slug ?? "");
  const [tabs, setTabs] = useState<Record<string, TabState>>(() =>
    active ? { [active]: { projects: initial, page: 1, lastPage: initial.length < PAGE_SIZE ? 1 : 2 } } : {},
  );
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const current = tabs[active];

  const load = async (slug: string, page: number) => {
    setLoading(true);
    setFailed(false);
    try {
      const params = new URLSearchParams({ type, category: slug, page: String(page), perPage: String(PAGE_SIZE) });
      const result = await api<Paginated<Project>>(`/projects?${params}`);
      setTabs((previous) => ({
        ...previous,
        [slug]: {
          projects: page === 1 ? result.data : [...(previous[slug]?.projects ?? []), ...result.data],
          page: result.meta.current_page,
          lastPage: result.meta.last_page,
        },
      }));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const select = (slug: string) => {
    setActive(slug);
    if (!tabs[slug]) load(slug, 1);
  };

  const tabList = showSeeMore ? categories.slice(0, VISIBLE_TABS) : categories;

  return (
    <section className="py-12">
      <div className="page-container flex flex-col gap-2.5">
        <h2 className="text-center text-[28.8px] leading-9 font-bold uppercase">{title}</h2>

        <div className="flex items-center gap-6 overflow-x-auto pb-1 [scrollbar-width:none] lg:justify-between">
          <div role="tablist" className="flex gap-6 lg:contents">
            {tabList.map((category) => (
              <button
                key={category.slug}
                type="button"
                role="tab"
                aria-selected={category.slug === active}
                onClick={() => select(category.slug)}
                className={`shrink-0 border-b-2 pb-1 text-lg whitespace-nowrap capitalize lg:text-xl ${
                  category.slug === active ? "border-foreground font-medium" : "border-transparent text-foreground/80"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          {showSeeMore && (
            <Link href="/categories" className="flex shrink-0 items-center gap-2.5 pb-1 text-lg whitespace-nowrap text-link capitalize lg:text-xl">
              {t("seeMore")}
              <Image src="/images/see-more-arrow.svg" alt="" width={20} height={20} className="rtl:-scale-x-100" />
            </Link>
          )}
        </div>

        <div role="tabpanel" aria-busy={loading} className="flex flex-col gap-2.5">
          {current?.projects.length ? (
            <div className="grid grid-cols-[repeat(auto-fill,212px)] justify-center gap-5 py-1">
              {current.projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-muted">
              {loading ? t("loading") : failed ? t("loadFailed") : t("noProjects")}
            </p>
          )}

          {current && current.page < current.lastPage && (
            <button
              type="button"
              disabled={loading}
              onClick={() => load(active, current.page + 1)}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-border px-1 py-2 text-sm font-medium capitalize shadow-[0_2px_2px_rgba(133,133,133,0.25)] hover:opacity-85 disabled:opacity-60"
            >
              <Image src="/images/add.svg" alt="" width={20} height={20} className="dark:invert" />
              {loading ? t("loading") : t("showAll")}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
