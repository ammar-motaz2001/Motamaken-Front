import { SearchX } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

/** Empty search result with a link to browse the categories instead. */
export function NoResults() {
  const t = useTranslations("Search");

  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <SearchX className="size-20 text-placeholder" strokeWidth={1} aria-hidden />
      <p className="max-w-md text-sm text-muted">{t("empty")}</p>
      <Button variant="orange" font="button" pill href="/categories">
        {t("browse")}
      </Button>
      <a href="#search-filters" className="rounded-full border border-orange px-6 py-1.5 text-sm font-medium text-orange hover:bg-orange/10">
        {t("editSearch")}
      </a>
    </div>
  );
}
