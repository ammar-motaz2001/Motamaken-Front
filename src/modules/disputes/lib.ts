import type { StatusTone } from "@/components/ui/StatusPill";
import type { DisputeStatus } from "@/lib/api/types";

export const DISPUTE_TONE: Record<DisputeStatus, StatusTone> = { open: "danger", under_review: "warning", resolved: "success", withdrawn: "muted" };
