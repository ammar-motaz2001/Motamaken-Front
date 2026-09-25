import type { CategoryKey, ExtraKey, RoleKey, TeamMember } from "../types";

export const CATEGORIES: Record<CategoryKey, string[]> = {
  design: ["branding", "uiux"],
  programming: ["web", "mobile"],
  writing: ["content", "translation"],
  marketing: ["social", "seo"],
};

export const EXTRAS: ExtraKey[] = ["urgent", "featured", "maintenance"];

export const ROLES: RoleKey[] = ["lead", "frontend", "backend", "designer", "writer", "marketer"];

export const SHARE_OPTIONS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

export const SHARE_STEP = 5;

export const STEP_COUNT = { individual: 3, team: 4 } as const;

export const INITIAL_MEMBERS: TeamMember[] = [
  { id: "owner", role: "lead", share: 45, status: "owner" },
  { id: "abdulrahman", personKey: "abdulrahman", role: "frontend", share: 30, status: "accepted" },
  { id: "dana", personKey: "dana", role: "writer", share: 25, status: "pending" },
];

export const DEMO_INVITATION = {
  inviter: "sara",
  role: "frontend",
  share: 30,
  total: 3200,
  team: [
    { id: "lead", personKey: "sara", role: "lead", share: 45 },
    { id: "dana", personKey: "dana", role: "writer", share: 25 },
  ],
} as const;
