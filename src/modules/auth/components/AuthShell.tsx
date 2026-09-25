import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { AuthMethod } from "../types";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  tabs?: { basePath: string; active: AuthMethod };
  children: ReactNode;
};

const TABS = [
  { method: "email", label: "email" },
  { method: "phone", label: "mobile" },
] as const;

export function AuthShell({ title, subtitle, tabs, children }: AuthShellProps) {
  const t = useTranslations("Auth");

  return (
    <section className="flex w-full flex-col items-center px-4 pt-12 pb-[103px]">
      <div className="flex flex-col items-center gap-1 pb-8 text-center leading-7 capitalize">
        <h1 className="text-2xl font-bold text-brand">{title}</h1>
        {subtitle && <p className="text-base font-medium">{subtitle}</p>}
      </div>

      {tabs && (
        <div role="tablist" className="flex w-full justify-center pb-4 sm:w-auto">
          {TABS.map((tab) => {
            const active = tab.method === tabs.active;
            return (
              <Link
                key={tab.method}
                href={{ pathname: tabs.basePath, query: { method: tab.method } }}
                role="tab"
                aria-selected={active}
                replace
                scroll={false}
                className={`flex flex-1 items-center justify-center border-2 px-4 py-3 text-base font-medium whitespace-nowrap first:rounded-s-lg last:rounded-e-lg sm:flex-none sm:px-[33px] sm:py-3.5 sm:first:min-w-[162px] sm:last:min-w-[173px] ${
                  active
                    ? "border-brand-border bg-gradient-brand text-white"
                    : "border-transparent bg-surface text-foreground/70 shadow-tab"
                }`}
              >
                {t(tab.label)}
              </Link>
            );
          })}
        </div>
      )}

      {children}
    </section>
  );
}

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full max-w-[872px] flex-col gap-4 rounded-xl bg-surface px-4 pt-4 pb-6 shadow-card dark:border dark:border-border">
      {children}
    </div>
  );
}
