import type { StatusTone } from "@/components/ui/StatusPill";
import type { Team, TeamMemberStatus } from "@/lib/api/types";

export const MEMBER_STATUS_TONE: Record<TeamMemberStatus, StatusTone> = {
  invited: "warning",
  accepted: "success",
  declined: "danger",
  expired: "muted",
};

export const TEAM_STATUS_TONE: Record<Team["status"], StatusTone> = {
  draft: "warning",
  active: "success",
  disbanded: "muted",
};
