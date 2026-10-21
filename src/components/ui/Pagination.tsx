import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type PaginationProps = {
  page: number;
  lastPage: number;
  pathname: string;
  query?: Record<string, string | undefined>;
};

/** Page links for a server-rendered list: keeps the current filters in the URL and hides itself when there is one page. */
export function Pagination({ page, lastPage, pathname, query = {} }: PaginationProps) {
  const t = useTranslations("Common");
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

  return (
    <nav aria-label={t("pagination")} className="flex items-center justify-center gap-2 pt-4">
      {page > 1 && (
        <Link href={href(page - 1)} className={linkClasses}>
          {t("previous")}
        </Link>
      )}
      <span className="px-2 text-sm text-muted">{t("pageOf", { page, total: lastPage })}</span>
      {page < lastPage && (
        <Link href={href(page + 1)} className={linkClasses}>
          {t("next")}
        </Link>
      )}
    </nav>
  );
}
