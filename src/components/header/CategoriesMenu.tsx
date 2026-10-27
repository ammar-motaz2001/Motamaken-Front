"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useDismiss } from "@/components/ui/useDismiss";
import { Link } from "@/i18n/navigation";
import type { Category, CategoryType } from "@/lib/api/types";
import { usePresence } from "@/components/ui/usePresence";

const TABS: CategoryType[] = ["project", "influencer"];

/** Categories mega-menu with project and influencer tabs, each category linking to its list. */
export function CategoriesMenu({ categories }: { categories: Category[] }) {
  const t = useTranslations("Header");
  const ref = useRef<HTMLLIElement>(null);
  const [open, setOpen] = useState(false);
  const menu = usePresence(open);
  const [tab, setTab] = useState<CategoryType>("project");
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, ref, close);

  return (
    <li ref={ref} className="static">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-[35px] items-center gap-2 px-4 py-2.5 text-base font-bold whitespace-nowrap text-white hover:opacity-85"
      >
        {t("nav.categories")}
        <Image
          src="/images/arrow-down-white.svg"
          alt=""
          width={16}
          height={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {menu.mounted && (
        <div className={`${menu.leaving ? "pop-leave" : "pop-down"} page-container absolute inset-x-0 top-full z-40`}>
          <div className="glass rounded-b-xl border border-t-0 border-border p-6 text-foreground">
            <h2 className="mb-4 text-xl font-bold uppercase">{t("nav.categories")}</h2>
            <div role="tablist" className="mb-5 flex gap-6 border-b border-border">
              {TABS.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={item === tab}
                  onClick={() => setTab(item)}
                  className={`-mb-px border-b-2 pb-1 text-base ${item === tab ? "border-foreground font-medium" : "border-transparent text-muted"}`}
                >
                  {t(`categoryTabs.${item}`)}
                </button>
              ))}
            </div>
            <ul role="tabpanel" className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {categories
                .filter((category) => category.type === tab)
                .map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/categories/${category.slug}`}
                      onClick={close}
                      className="flex h-full flex-col items-center gap-2 rounded-lg border border-border px-3 py-4 text-center hover:border-brand"
                    >
                      <CategoryIcon icon={category.icon} className="size-7 text-brand" />
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="mt-auto rounded-md bg-gradient-orange px-4 py-1 text-xs font-medium text-white">
                        {t("letsStart")}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}
