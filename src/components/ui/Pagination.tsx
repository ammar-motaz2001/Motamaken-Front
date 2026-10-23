"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";

type PaginationProps = {
  page: number;
  lastPage: number;
  pathname: string;
  query?: Record<string, string | undefined>;
};

/** Room left above the list when it is brought into view (the sticky header). */
const TOP_OFFSET = 110;

/**
 * Page links for a server-rendered list: keeps the current filters in the URL and hides itself when there is one page.
 * Changing page does not jump to the top of the site: once the new page has loaded it glides to the first results of
 * the list (the element above the links), and only if they are above the screen.
 */
export function Pagination({ page, lastPage, pathname, query = {} }: PaginationProps) {
  const t = useTranslations("Common");
  const nav = useRef<HTMLElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    // The results just above the page links (falling back to their section), not the filters or the page header.
    const list = nav.current?.previousElementSibling ?? nav.current?.closest("section") ?? nav.current?.parentElement;
    if (!list) return;
    const top = list.getBoundingClientRect().top;
    if (top < TOP_OFFSET) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: window.scrollY + top - TOP_OFFSET, behavior: reduced ? "auto" : "smooth" });
    }
  }, [page]);

  if (lastPage <= 1) return null;

  const href = (target: number) => {
    const params = new URLSearchParams(
      Object.entries({ ...query, page: target > 1 ? String(target) : undefined }).filter(
        (entry): entry is [string, string] => Boolean(entry[1]),
      ),
    );
    const search = params.toString();
    return search ? `${pathname}?${search}` : pathname;
  };

  const linkClasses = "rounded-md border border-border px-3 py-1.5 text-sm hover:border-brand";
  const go = () => {
    moved.current = true;
  };

  return (
    <nav ref={nav} aria-label={t("pagination")} className="flex items-center justify-center gap-2 pt-4">
      {page > 1 && (
        <Link href={href(page - 1)} scroll={false} onClick={go} className={linkClasses}>
          {t("previous")}
        </Link>
      )}
      <span className="px-2 text-sm text-muted" aria-live="polite">
        {t("pageOf", { page, total: lastPage })}
      </span>
      {page < lastPage && (
        <Link href={href(page + 1)} scroll={false} onClick={go} className={linkClasses}>
          {t("next")}
        </Link>
      )}
    </nav>
  );
}
