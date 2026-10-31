"use client";

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
      <a
        href="#search-filters"
        // Bring the filters into view and put the cursor in the first field, ready to type.
        onClick={(event) => {
          const field = document.querySelector<HTMLInputElement>("#search-filters input:not([type=hidden])");
          if (!field) return;
          event.preventDefault();
          field.scrollIntoView({ behavior: "smooth", block: "center" });
          field.focus({ preventScroll: true });
        }}
        className="rounded-full border border-orange px-6 py-1.5 text-sm font-medium text-orange hover:bg-orange/10">
        {t("editSearch")}
      </a>
    </div>
  );
}
