import { MapPin, Tag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { panelClasses, sectionTitleClasses } from "@/components/ui/styles";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Link } from "@/i18n/navigation";
import type { AgreementChange, Escrow, Project, Proposal, Review } from "@/lib/api/types";
import { timeAgo } from "@/lib/format";
import { EscrowPanel } from "@/modules/escrow";
import { ProjectReviews } from "@/modules/reviews";
import { PROJECT_STATUS_TONE } from "../lib/status";
import { AgreementPanel } from "./AgreementPanel";
import { MessageUserButton } from "./MessageUserButton";
import { OfferPanel } from "./OfferPanel";
import { OwnerPanel } from "./OwnerPanel";
import { BidiText } from "@/components/ui/BidiText";
import { BudgetRange } from "@/components/providers/CurrencyProvider";

type ProjectViewProps = {
  /** Site settings › Messaging policy: only the owner starts conversations. */
  ownersWriteFirst?: boolean;
  project: Project;
  viewerId: number | null;
  proposals: Proposal[] | null;
  escrow: Escrow | null;
  reviews?: { data: Review[]; canReview: boolean; canReply?: boolean } | null;
  /** Change / cancel requests; null unless the viewer is the client or the hired freelancer. */
  agreementChanges?: AgreementChange[] | null;
};

/**
 * Full project page: details, budget, owner and tags, then the owner's panel or the offer form; hired parties
 * also see the escrow and, when completed, the reviews.
 */
export function ProjectView({ project, viewerId, proposals, escrow, reviews, agreementChanges, ownersWriteFirst = false }: ProjectViewProps) {
  const t = useTranslations("Projects");
  const locale = useLocale();
  const isOwner = viewerId === project.owner.id;
  const { min, max, currency } = project.budget;
  const location = [project.city, project.country].filter(Boolean).join(", ");
  const accepted = proposals?.find((proposal) => proposal.id === project.acceptedProposalId);
  const hired = project.status === "in_progress" || project.status === "completed";
  // A finished or cancelled project without a contract has nothing left to fund: no payment-protection setup then.
  const showEscrow = Boolean(viewerId) && hired && (Boolean(escrow) || ((isOwner || project.myProposal?.status === "accepted") && project.status === "in_progress"));

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
            {/* The project's own currency (the one offers are made in), with the visitor's in brackets when it differs. */}
            <BudgetRange message="Projects.detail.budget" min={min} max={max} currency={currency} original />
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
          {/* Each line takes the direction of its own text, so English words and punctuation stay in order inside Arabic. */}
          <p className="leading-relaxed whitespace-pre-line [unicode-bidi:plaintext]"><BidiText text={project.description} /></p>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <UserAvatar name={project.owner.fullName} src={project.owner.avatarUrl} size={44} online={project.owner.isOnline} />
          <div className="me-auto">
            <p className="text-xs text-muted">{t("detail.postedBy")}</p>
            <Link href={`/users/${project.owner.id}`} className="font-bold hover:text-brand">
              {project.owner.fullName}
            </Link>
          </div>
          {/* With "owners write first" on, only the owner starts a conversation (they write to the people who sent offers). */}
          {!isOwner && !ownersWriteFirst && <MessageUserButton userId={project.owner.id} projectId={project.id} />}
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
          proofRequired={project.type === "influencer_request"}
        />
      )}

      {agreementChanges && (
        <AgreementPanel
          projectId={project.id}
          open={project.status === "in_progress"}
          offer={accepted ? { amount: accepted.amount, currency: accepted.currency, deliveryDays: accepted.deliveryDays } : project.myProposal?.status === "accepted" ? { amount: project.myProposal.amount, currency: project.myProposal.currency, deliveryDays: project.myProposal.deliveryDays } : null}
          changes={agreementChanges}
        />
      )}

      {isOwner ? (
        <OwnerPanel project={project} proposals={proposals ?? []} />
      ) : (
        // Guests write their offer too; they confirm an email or phone only when sending it.
        <OfferPanel project={project} />
      )}
    </div>
  );
}
