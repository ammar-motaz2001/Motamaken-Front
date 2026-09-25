export type ProjectMode = "individual" | "team";

export type StepKey = "details" | "budget" | "team" | "publish";

export type MemberStatus = "owner" | "accepted" | "pending";

export type PersonKey = "sara" | "abdulrahman" | "dana";

export type RoleKey = "lead" | "frontend" | "backend" | "designer" | "writer" | "marketer";

export type CategoryKey = "design" | "programming" | "writing" | "marketing";

export type ExtraKey = "urgent" | "featured" | "maintenance";

export type TeamMember = {
  id: string;
  personKey?: PersonKey;
  name?: string;
  role: RoleKey;
  share: number;
  status: MemberStatus;
};

export type ProjectDetails = {
  category: CategoryKey | "";
  subcategory: string;
  extras: ExtraKey[];
};

export type ProjectBudget = {
  title: string;
  description: string;
  amount: string;
  duration: string;
};
