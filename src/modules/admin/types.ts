import type { AgreementChange, FooterColumn, UserBrief } from "@/lib/api/types";

type Meta = { current_page: number; last_page: number; per_page: number; total: number };

export type List<T> = { data: T[]; meta: Meta };

export type Overview = {
  users: { total: number; verified: number; newThisWeek: number; suspended: number };
  projects: Record<string, number>;
  money: { currency: string; inWallets: number; inEscrow: number; revenue: number; pendingWithdrawals: number }[];
  usersByType: { client: number; freelancer: number; influencer: number };
  influencerRequests: Record<string, number>;
  proposals: Record<string, number>;
  engagement: { activeSubscriptions: number; activePromotions: number; pointsIssued: number; pointsSpent: number; medalsAwarded: number };
  queues: {
    pendingWithdrawals: number;
    pendingKyc: number;
    openDisputes: number;
    openReports: number;
    newContactMessages: number;
    pendingAppeals: number;
    openTickets: number;
    pendingDeposits: number;
  };
  days: number;
  series: { date: string; users: number; projects: number; proposals: number; revenue: Record<string, number>; deposits: Record<string, number> }[];
  trends: {
    users: Trend;
    projects: Trend;
    proposals: Trend;
    revenue: Record<string, Trend>;
    deposits: Record<string, Trend>;
  };
  topCategories: { id: number; name: string; projects: number }[];
  recent: {
    users: { id: number; fullName: string; avatarUrl: string | null; isVerified: boolean; createdAt: string }[];
    projects: { id: number; title: string; type: string; status: string; budget: { min: number; max: number; currency: string }; owner: string | null; createdAt: string }[];
  };
};

type Trend = { current: number; previous: number };

export type AdminUser = {
  id: number;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  username: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
  isVerified: boolean;
  kycStatus: KycState;
  accountType: "client" | "freelancer" | "influencer" | null;
  adminRole: { id: number; slug: string; nameEn: string; nameAr: string } | null;
  twoFactor: boolean;
  points: number;
  suspendedAt: string | null;
  suspendedUntil: string | null;
  suspensionReason: string | null;
  lastSeenAt: string | null;
  createdAt: string;
  stats?: { projects: number; offers: number; acceptedOffers: number; openDisputes: number; reviewsReceived: number; rating: number; reportsAgainst: number; referrals: number };
};

type KycState = "none" | "pending" | "approved" | "rejected" | "needs_update";

export type Person = { id: number; fullName: string; username?: string | null; avatarUrl: string | null };

export type AdminUserDetail = AdminUser & {
  registrationIp: string | null;
  referredBy: Person | null;
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  twoFactorMethod: string | null;
  profile: {
    id: number;
    type: string;
    jobTitle: string | null;
    bio: string | null;
    skills: string[];
    channels: { platform?: string; handle: string; url?: string | null; followers?: number | null }[];
    experiences: { title: string; company: string }[];
    isFeatured: boolean;
    featuredUntil: string | null;
  } | null;
};

type AdminLogRow = { id: number; action: string; changes: Record<string, unknown> | null; admin: Person | null; createdAt: string };

export type UserActivity = {
  projects: { id: number; title: string; type: string; status: string; hidden: boolean; budgetMin: number; budgetMax: number; currency: string; proposals: number; createdAt: string }[];
  proposals: { id: number; projectId: number; project: string | null; status: string; amount: number; currency: string; deliveryDays: number; createdAt: string }[];
  reviewsReceived: ReviewRow[];
  reviewsGiven: ReviewRow[];
  points: { id: number; amount: number; reason: string; meta: Record<string, unknown> | null; manual: boolean; createdAt: string }[];
  medals: { code: string; name: string | null; awardedAt: string | null; manual: boolean; reason: string | null }[];
  kyc: { id: number; submissionId: number; status: string; note: string | null; actor: Person | null; createdAt: string }[];
  sessions: { id: number; ip: string | null; userAgent: string | null; lastUsedAt: string | null; createdAt: string }[];
  reports: { id: number; reason: string; details: string | null; status: string; reporter: Person | null; createdAt: string }[];
  notes: { id: number; body: string; author: Person | null; createdAt: string }[];
  adminLog: AdminLogRow[];
};

type ReviewRow = { id: number; projectId: number; rating: number; comment: string | null; hidden: boolean; user: Person | null; createdAt: string };

export type WalletBalance = { currency: string; available: number; inEscrow: number; incoming: number; pendingWithdrawals: number };

export type AdminProject = {
  id: number;
  type: "project" | "influencer_request";
  title: string;
  excerpt: string;
  budget: { min: number; max: number; currency: string };
  status: string;
  proposalsCount?: number;
  isFeatured?: boolean;
  category: { id: number; name: string } | null;
  owner: UserBrief;
  createdAt: string;
};

export type AdminWithdrawal = {
  id: number;
  amount: number;
  fee: number;
  currency: string;
  method: string;
  destination: string;
  status: "pending" | "paid" | "rejected" | "cancelled";
  payoutReference: string | null;
  rejectReason: string | null;
  user: UserBrief;
  createdAt: string;
  reviewedAt: string | null;
};

export type KycSubmission = {
  id: number;
  status: "pending" | "approved" | "rejected" | "needs_update";
  documentType: string;
  documentNumber: string;
  fullName: string;
  dateOfBirth: string;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  user?: UserBrief;
  documentNumberFull?: string;
  files?: { front: string | null; back: string | null; selfie: string | null };
  history?: { id: number; submissionId: number; status: string; note: string | null; actor: { id: number; fullName: string } | null; createdAt: string }[];
};

export type AdminReport = {
  id: number;
  targetType: "user" | "project" | "portfolio" | "review" | "message" | "proposal" | "team";
  targetId: number;
  target: { title: string; path: string | null; context?: string | null } | null;
  priority: "low" | "normal" | "high";
  source: "user" | "ai";
  actionTaken: string | null;
  handledBy: { id: number; fullName: string } | null;
  reason: string;
  details: string | null;
  status: "open" | "actioned" | "dismissed";
  resolutionNote: string | null;
  reporter: { id: number; fullName: string; avatarUrl: string | null } | null;
  createdAt: string;
  reviewedAt: string | null;
};

export type AdminFeedback = {
  id: number;
  context: string;
  referenceId: number | null;
  rating: "up" | "down";
  comment: string | null;
  user: { id: number; fullName: string; avatarUrl: string | null } | null;
  createdAt: string;
};

export type ContactMessage = {
  id: number;
  userId: number | null;
  name: string;
  email: string;
  topic: string;
  subject: string;
  message: string;
  status: "new" | "handled";
  adminNote: string | null;
  reply: string | null;
  repliedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  handledAt: string | null;
};

export type AdminPage = {
  slug: string;
  section: "about" | "help" | "legal";
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  metaTitleEn: string | null;
  metaTitleAr: string | null;
  metaDescriptionEn: string | null;
  metaDescriptionAr: string | null;
  noindex: boolean;
  isPublished: boolean;
  sortOrder: number;
  updatedAt: string | null;
};

export type AdminCategory = {
  id: number;
  type: "project" | "influencer";
  slug: string;
  nameEn: string;
  nameAr: string;
  icon: string | null;
  sortOrder: number;
  projects: number;
  parentId: number | null;
  isActive: boolean;
};

export type AdminPlan = {
  id: number;
  code: string;
  audience: "client" | "freelancer";
  name: string;
  price: number;
  currency: string;
  isFree: boolean;
  isPopular: boolean;
  isActive?: boolean;
  perks: string[];
  features: Record<string, number | boolean | null> | [];
  subscribers: number;
};

export type AdminDraw = {
  id: number;
  title_en: string;
  title_ar: string;
  ticket_cost: number;
  max_tickets_per_user: number | null;
  starts_at: string;
  draw_at: string;
  status: "open" | "drawn" | "cancelled";
  prizes: { rank: number; name_en: string; name_ar: string; kind: "cash" | "item"; value: number | null; currency: string | null }[];
  drawn_at: string | null;
  entries_count: number;
  entries_sum_tickets: number | null;
};

export type SiteSettings = {
  siteFeePercent: number;
  depositMin: number;
  depositMax: number;
  withdrawalMin: number;
  withdrawalFee: number;
  withdrawalRequiresKyc: boolean;
};

export type LedgerTransaction = {
  id: number;
  type: string;
  description: string | null;
  reference: { type: string; id: number } | null;
  entries: { account: { id: number; type: string; currency: string; userId: number | null }; amount: number; balanceAfter: number }[];
  createdBy?: { id: number; fullName: string } | null;
  createdAt: string;
};

export type TrialBalance = { currency: string; balanced: boolean; accounts: { type: string; accounts: number; balance: number }[] }[];

export type AffiliateOverview = {
  totals: { referrers: number; referredUsers: number; qualifiedReferrals: number; visits: number; commissions: { currency: string; amount: number }[] };
  topReferrers: { userId: number; fullName: string | null; tier: string | null; qualifiedReferrals: number; earned: number; currency: string }[];
  recent: { id: number; referrer: string; referred: string; ratePercent: number; amount: number; currency: string; createdAt: string }[];
};

export type AdminProjectDetail = AdminProject & {
  hiddenAt: string | null;
  hiddenReason: string | null;
  acceptedProposalId: number | null;
  description?: string;
  proposals: { id: number; user: Person | null; team: { id: number; name: string } | null; amount: number; currency: string; deliveryDays: number; message: string; status: string; createdAt: string }[];
  escrow: AdminEscrow | null;
  disputes: { id: number; status: string; reason: string; resolution: string | null; openedBy: Person | null; against: Person | null; createdAt: string }[];
  agreementChanges: AgreementChange[];
  reviews: { id: number; rating: number; comment: string | null; hidden: boolean; reviewer: Person | null; reviewee: Person | null; createdAt: string }[];
  reports: { id: number; reason: string; details: string | null; status: string; source: string; reporter: Person | null; createdAt: string }[];
  adminLog: AdminLogRow[];
  matches: (Person & { profileId: number; jobTitle: string | null; rating: number; score: number })[];
};

export type AdminEscrow = {
  id: number;
  project: { id: number; title: string; type: string; status: string } | null;
  client: Person | null;
  payees: { user: Person | null; sharePercent: number; isLead: boolean; splitStatus: string; splitNote: string | null }[];
  currency: string;
  total: number;
  held: number;
  released: number;
  refunded: number;
  status: "awaiting_funding" | "active" | "completed" | "cancelled";
  milestoneStatuses: Record<string, number>;
  milestones: {
    id: number; position: number; title: string; amount: number; status: string; dueDate: string | null; fee: number; refunded: number;
    submissionNote: string | null; changesNote: string | null; fundedAt: string | null; submittedAt: string | null; releasedAt: string | null;
  }[] | null;
  transactions?: { id: number; type: string; description: string | null; meta: Record<string, unknown> | null; createdAt: string }[];
  createdAt: string;
};

export type AdminProposal = {
  id: number;
  project: { id: number; title: string; type: string; status: string; owner: Person | null } | null;
  user: Person | null;
  team: { id: number; name: string } | null;
  amount: number;
  currency: string;
  deliveryDays: number;
  message: string;
  status: string;
  isAccepted: boolean;
  createdAt: string;
};

export type AdminTeam = { id: number; name: string; status: string; owner: Person | null; members: number; proposals: number; publishedAt: string | null; createdAt: string };

export type AdminTeamDetail = {
  id: number; name: string; description: string | null; status: string; owner: Person | null; publishedAt: string | null; createdAt: string;
  members: { id: number; user: Person | null; roleTitle: string | null; sharePercent: number; status: string; isLead: boolean; invitedAt: string | null; expiresAt: string | null; respondedAt: string | null }[];
  proposals: { id: number; projectId: number; project: string | null; status: string; amount: number; currency: string; createdAt: string }[];
  groupChats: { id: number; title: string | null; projectId: number | null; messages: number; lastMessageAt: string | null }[];
  reports: { id: number; reason: string; details: string | null; status: string; reporter: Person | null; createdAt: string }[];
};

export type AdminReview = {
  id: number; rating: number; comment: string | null; project: { id: number; title: string } | null; reviewer: Person | null; reviewee: Person | null;
  about: string; hidden: boolean; hiddenReason: string | null; reports: number; createdAt: string;
};

export type AdminDeposit = {
  id: number; user: Person | null; amount: number; currency: string; method: string; provider: string; providerRef: string;
  status: "pending" | "succeeded" | "failed"; failureReason: string | null; paidAt: string | null; createdAt: string;
};

export type AdminSubscription = {
  id: number; user: Person | null; plan: { id: number; nameEn: string; nameAr: string; audience: string; price: number; currency: string } | null;
  status: string; autoRenew: boolean; currentPeriodStart: string | null; currentPeriodEnd: string | null; cancelledAt: string | null; createdAt: string;
};

export type AdminPromotion = {
  id: number; user: Person | null; kind: string; package: string | null; project: { id: number; title: string } | null; days: number;
  price: number; currency: string; pointsAwarded: number; startsAt: string | null; endsAt: string | null; active: boolean; createdAt: string;
};

export type PromotionPrices = {
  prices: Record<string, Record<string, number>>;
  packages: { code: string; days: number; reach: [number, number]; prices: Record<string, number> }[];
  points: number;
};

export type AdminAppeal = {
  id: number; user: Person | null; reason: string; status: "pending" | "upheld" | "overturned";
  dispute: { id: number; caseNumber: string; resolution: string | null; clientPercent: number | null; resolutionNote: string | null; resolvedAt: string | null;
    project: { id: number; title: string } | null; milestone: { title: string; amount: number } | null; currency: string | null } | null;
  decisionNote: string | null; adjustment: number | null; adjustmentTo: string | null; decidedBy: Person | null; decidedAt: string | null; createdAt: string;
};

export type PointRule = { reason: string; label: string; amount: number; once: boolean };

export type AdminMedal = {
  id: number; code: string; nameEn: string; nameAr: string; descriptionEn: string | null; descriptionAr: string | null; icon: string | null;
  metric: string | null; target: number; isActive: boolean; sortOrder: number; holders: number;
};

export type AdminSkill = { id: number; slug: string; nameEn: string; nameAr: string; isActive: boolean; sortOrder: number; category: { id: number; nameEn: string; nameAr: string } | null };

export type AdminFaqGroup = {
  id: number; nameEn: string; nameAr: string; sortOrder: number; isActive: boolean;
  faqs: { id: number; categoryId: number; questionEn: string; questionAr: string; answerEn: string; answerAr: string; audience: string; isPublished: boolean; sortOrder: number }[];
};

export type Broadcast = {
  id: number; titleEn: string; titleAr: string; bodyEn: string; bodyAr: string; audience: string; user: Person | null; channels: string[];
  recipients: number; createdBy: Person | null; createdAt: string;
};

export type NotificationTemplateRow = {
  type: string; group: string; defaultEn: string; defaultAr: string; placeholders: string[];
  custom: { textEn: string; textAr: string; subjectEn: string | null; subjectAr: string | null; isActive: boolean; updatedAt: string | null } | null;
};

export type MailSettings = {
  mailer: string; overridden: boolean; host: string | null; port: number; username: string | null; scheme: string | null; hasPassword: boolean;
  fromAddress: string | null; fromName: string | null; last24h: { sent: number; failed: number };
};

export type IntegrationStatus = { service: string; status: "ok" | "warning" | "error" | "off"; details: Record<string, unknown> };

/** A currency of the marketplace as the admins manage it; `inUse` when users hold money in it. */
/** `rate`: units per one US dollar, used to show prices in each visitor's currency. */
export type AdminCurrency = { code: string; symbol: string; nameEn: string; nameAr: string; active: boolean; inUse: boolean; rate: number };

export type SiteConfig = {
  site: Record<string, string | null>;
  social: Record<string, string | null>;
  apps: Record<string, string | null>;
  footer: FooterColumn[] | null;
  maintenance: { enabled: boolean; messageEn: string; messageAr: string; endsAt: string | null };
  uploads: { avatarMb: number; portfolioMb: number; documentMb: number; chatMb: number; attachmentTypes: string[] };
  seo: { descriptionEn: string | null; descriptionAr: string | null };
  security: { requireAdmin2fa: boolean; ownersWriteFirst?: boolean };
  payments: { depositMethods: string[]; withdrawalMethods: string[] };
  choices: { attachmentTypes: string[]; depositMethods: string[]; withdrawalMethods: string[]; social: string[] };
};

export type BlacklistRow = { id: number; type: string; value: string; reason: string; createdBy: Person | null; expiresAt: string | null; expired: boolean; createdAt: string };

export type StaffMember = Person & {
  email: string | null; phone: string | null; role: AdminRoleRow | null; fullAccess: boolean; twoFactor: boolean; lastSeenAt: string | null;
  sessions: number; actions: number; lastActionAt: string | null;
};

export type AdminRoleRow = { id: number; slug: string; nameEn: string; nameAr: string; permissions: string[]; isSystem: boolean; users?: number };

export type AuditRow = { id: number; admin: Person | null; action: string; subjectType: string | null; subjectId: number | null; changes: Record<string, unknown> | null; ip: string | null; createdAt: string };
