import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Project } from "@/lib/api/types";
import { formatAmount, timeAgo } from "@/lib/format";
import { FavoriteButton } from "./FavoriteButton";
import { buttonClasses } from "@/components/ui/Button";

const EXCERPT_LENGTH = 36;

/** Cuts a description to the card's excerpt length, ending with an ellipsis. */
function shorten(text: string) {
  return text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH).trimEnd()}…` : text;
}

/** Card of one project in lists and carousels: title, budget, owner, read-more and add-offer links and a save heart. */
export function ProjectCard({ project }: { project: Project }) {
  const t = useTranslations("Home");
  const locale = useLocale();
  const { min, max, currency } = project.budget;
  const href = `/projects/${project.id}`;

  return (
    <article className="flex min-h-[293px] w-[212px] shrink-0 in-[.card-grid]:w-auto snap-start flex-col gap-2.5 rounded-xl bg-surface px-2.5 pt-4 pb-[21px] shadow-card dark:border dark:border-border">
      <div className="flex flex-col gap-3">
        <h3 className="line-clamp-2 text-start text-xl leading-tight font-bold tracking-[-0.22px]">
          <Link href={href} className="hover:text-brand">
            {project.title}
          </Link>
        </h3>
        <span className="self-start rounded-lg border border-brand-ink bg-brand-soft px-3 py-1.5 text-sm leading-snug font-medium text-brand-ink">
          {t("budget", { min: formatAmount(min, currency, locale), max: formatAmount(max, currency, locale) })}
        </span>
        <div className="flex items-center gap-2">
          <span className="flex min-w-0 flex-1 items-center gap-1 text-sm tracking-[-0.154px] text-brand">
            <Image src="/images/user-outline.svg" alt="" width={15} height={15} />
            <span className="truncate">{project.owner.fullName}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted" suppressHydrationWarning>
            <Image src="/images/clock.svg" alt="" width={15} height={15} className="dark:invert" />
            {timeAgo(project.createdAt, locale)}
          </span>
        </div>
      </div>
      <p className="line-clamp-3 text-base tracking-[-0.176px] text-muted">
        {shorten(project.description)}{" "}
        <Link href={href} className="text-brand hover:underline">
          {t("readMore")}
        </Link>
      </p>
      <div className="mt-auto flex gap-2 pt-1">
        <Link
          href={href}
          className={`${buttonClasses({ size: "sm", pill: true })} min-w-0 flex-1`}
        >
          {t("addOffer")}
        </Link>
        <FavoriteButton kind="project" id={project.id} className="size-[42px]! shrink-0 border border-border shadow-none!" />
      </div>
    </article>
  );
}
