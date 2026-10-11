import { Link } from "@/i18n/navigation";

type StatusTabsProps = {
  pathname: string;
  active: string;
  tabs: { value: string; label: string }[];
};

export function StatusTabs({ pathname, active, tabs }: StatusTabsProps) {
  return (
    <nav className="flex gap-5 overflow-x-auto border-b border-border [scrollbar-width:none]">
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          href={tab.value ? `${pathname}?status=${tab.value}` : pathname}
          aria-current={tab.value === active ? "page" : undefined}
          className={`-mb-px shrink-0 border-b-2 pb-2 text-sm whitespace-nowrap ${
            tab.value === active ? "border-brand font-bold text-brand" : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
