import { MapPin, Tag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { panelClasses, sectionTitleClasses } from "@/components/ui/styles";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Link } from "@/i18n/navigation";
import type { Escrow, Project, Proposal, Review } from "@/lib/api/types";
import { formatAmount, timeAgo } from "@/lib/format";
import { EscrowPanel } from "@/modules/escrow";
import { ProjectReviews } from "@/modules/reviews";
import { PROJECT_STATUS_TONE } from "../lib/status";
import { MessageUserButton } from "./MessageUserButton";
import { OfferPanel } from "./OfferPanel";
import { OwnerPanel } from "./OwnerPanel";

type ProjectViewProps = {
  project: Project;
  viewerId: number | null;
  proposals: Proposal[] | null;
  escrow: Escrow | null;
  reviews?: { data: Review[]; canReview: boolean } | null;
};

export function ProjectView({ project, viewerId, proposals, escrow, reviews }: ProjectViewProps) {
  const t = useTranslations("Projects");
  const locale = useLocale();
  const isOwner = viewerId === project.owner.id;
  const { min, max, currency } = project.budget;
  const location = [project.city, project.country].filter(Boolean).join(", ");
  const accepted = proposals?.find((proposal) => proposal.id === project.acceptedProposalId);
  const hired = project.status === "in_progress" || project.status === "completed";
  const showEscrow = Boolean(viewerId) && hired && (isOwner || Boolean(escrow) || project.myProposal?.status === "accepted");

  return (
    <div className="flex flex-col gap-6">
      <section className={`${panelClasses} flex flex-col gap-5`}>
        <PageHeader
          crumbs={[
            { label: t("breadcrumb.home"), href: "/" },
            { label: t("breadcrumb.projects"), href: "/projects" },
            { label: project.title },
          ]}
          title={project.title}
          actions={<StatusPill tone={PROJECT_STATUS_TONE[project.status]}>{t(`status.${project.status}`)}</StatusPill>}
        />

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="rounded-lg border border-brand-ink bg-brand-soft px-3 py-1 font-medium text-brand-ink">
            {t("detail.budget", { min: formatAmount(min, currency, locale), max: formatAmount(max, currency, locale) })}
          </span>
          <span className="flex items-center gap-1.5 text-muted">
            <CategoryIcon icon={project.category.icon} className="size-4 text-brand" />
            {project.category.name}
          </span>
          <span className="flex items-center gap-1.5 text-muted">
            <Tag className="size-4" />
            {t(`types.${project.type}`)}
          </span>
          {location && (
            <span className="flex items-center gap-1.5 text-muted">
              <MapPin className="size-4" />
              {location}
            </span>
          )}
          <span className="text-muted" suppressHydrationWarning>
            {timeAgo(project.createdAt, locale)}
          </span>
        </div>

        <div>
          <h2 className={`${sectionTitleClasses} mb-2`}>{t("detail.description")}</h2>
          <p className="leading-relaxed whitespace-pre-line">{project.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <UserAvatar name={project.owner.fullName} src={project.owner.avatarUrl} size={44} online={project.owner.isOnline} />
          <div className="me-auto">
            <p className="text-xs text-muted">{t("detail.postedBy")}</p>
            <Link href={`/users/${project.owner.id}`} className="font-bold hover:text-brand">
              {project.owner.fullName}
            </Link>
          </div>
          {viewerId && !isOwner && <MessageUserButton userId={project.owner.id} projectId={project.id} />}
        </div>
      </section>

      {reviews && (
        <ProjectReviews
          projectId={project.id}
          initial={reviews}
          otherName={isOwner ? (accepted?.freelancer?.fullName ?? escrow?.payees.find((payee) => payee.isLead)?.fullName ?? null) : project.owner.fullName}
        />
      )}

      {showEscrow && viewerId && (
        <EscrowPanel
          projectId={project.id}
          escrow={escrow}
          viewerId={viewerId}
          isClient={isOwner}
          offer={accepted ? { amount: accepted.amount, currency: accepted.currency } : null}
        />
      )}

      {isOwner ? (
        <OwnerPanel project={project} proposals={proposals ?? []} />
      ) : viewerId ? (
        <OfferPanel project={project} />
      ) : (
        <div className={`${panelClasses} flex flex-wrap items-center justify-between gap-3`}>
          <p className="text-sm">{t("detail.loginToOffer")}</p>
          <Button href={`/login?next=/projects/${project.id}`} variant="solid" pill>
            {t("detail.login")}
          </Button>
        </div>
      )}
    </div>
  );
}
