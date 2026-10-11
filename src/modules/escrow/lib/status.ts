import type { StatusTone } from "@/components/ui/StatusPill";
import type { MilestoneStatus, SplitStatus } from "@/lib/api/types";

export const MILESTONE_TONE: Record<MilestoneStatus, StatusTone> = {
  pending: "muted",
  funded: "warning",
  submitted: "warning",
  disputed: "danger",
  released: "success",
  refunded: "muted",
};

export const SPLIT_TONE: Record<SplitStatus, StatusTone> = { pending: "warning", approved: "success", objected: "danger" };

export const DISPUTE_REASONS = ["not_delivered", "quality", "not_as_described", "no_response", "payment", "other"] as const;
