import type { StatusTone } from "@/components/ui/StatusPill";
import type { ProjectStatus, ProposalStatus } from "@/lib/api/types";

export const PROJECT_STATUS_TONE: Record<ProjectStatus, StatusTone> = {
  draft: "muted",
  open: "success",
  in_progress: "warning",
  completed: "muted",
  closed: "danger",
};

export const PROPOSAL_STATUS_TONE: Record<ProposalStatus, StatusTone> = {
  pending: "warning",
  accepted: "success",
  declined: "danger",
  withdrawn: "muted",
};
