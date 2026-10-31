export type Paginated<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
};

export type UserBrief = {
  id: number;
  fullName: string;
  username: string;
  avatarUrl: string | null;
  isOnline: boolean;
};

export type User = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  username: string;
  avatarUrl: string | null;
  email: string | null;
  emailVerifiedAt?: string | null;
  phone: string | null;
  phoneVerifiedAt?: string | null;
  points: number;
  locale: string | null;
  currency: string;
  theme: "light" | "dark" | null;
  isAdmin?: boolean;
  /** Admin panel permissions (empty for non-admins). */
  adminPermissions?: string[];
};

export type CategoryType = "project" | "influencer";

export type Category = {
  id: number;
  type: CategoryType;
  slug: string;
  name: string;
  icon: string;
};

export type ProjectType = "project" | "influencer_request";

export type ProjectStatus = "draft" | "open" | "in_progress" | "completed" | "closed";

export type Project = {
  id: number;
  type: ProjectType;
  title: string;
  description: string;
  excerpt: string;
  budget: { min: number; max: number; currency: string };
  status: ProjectStatus;
  /** Taken off the site by the moderators (owner and staff still see it). */
  isHidden?: boolean;
  hiddenReason?: string | null;
  proposalsCount?: number;
  acceptedProposalId: number | null;
  myProposal?: Proposal | null;
  category: Category;
  owner: UserBrief;
  country: string | null;
  city: string | null;
  createdAt: string;
};

export type ProfileCard = {
  id: number;
  userId: number;
  fullName: string;
  username: string;
  avatarUrl: string | null;
  /** Identity checked by the platform (approved KYC). */
  verified?: boolean;
  type: "freelancer" | "influencer";
  jobTitle: string | null;
  rating: number;
  reviewsCount: number;
  country: string | null;
  city: string | null;
};

export type Home = {
  featuredProfiles: ProfileCard[];
  distinctiveProjects: Project[];
  projectCategories: Category[];
  recentProjects: Project[];
  influencerPlatforms: Category[];
  latestInfluencerRequests: Project[];
};

export type Summary = {
  user: User;
  wallet: { balance: number; currency: string };
  points: number;
  unreadMessages: number;
  unreadNotifications: number;
  /** Counts beside the header and account-menu links. */
  counts?: { favorites: number; projects: number; offersReceived: number; offers: number };
};

/** `rate`: units of this currency per one US dollar (prices are converted with amount / rate(from) × rate(to)). */
export type Currency = { code: string; symbol: string; name: string; rate?: number };

export type Country = { id: number; code: string; name: string };

export type City = { id: number; countryId: number; name: string };

export type AppNotification = {
  id: string;
  type: string;
  message: string;
  /** Announcements from the staff: shown in bold above the message. */
  title?: string | null;
  user: { id: number; fullName: string; avatarUrl: string | null } | null;
  conversationId: number | null;
  projectId: number | null;
  proposalId: number | null;
  context?: Record<string, string | number | null> | null;
  readAt: string | null;
  createdAt: string;
};

type MessageType = "text" | "voice" | "attachment";

export type Conversation = {
  id: number;
  type: "direct" | "group";
  title: string | null;
  participant: UserBrief | null;
  participants: UserBrief[] | null;
  lastMessage: { id: number; type: MessageType; preview: string | null; isMine: boolean; createdAt: string } | null;
  unreadCount: number;
  project: { id: number; title: string } | null;
  updatedAt: string;
};

export type Message = {
  id: number;
  conversationId: number;
  senderId: number;
  sender?: UserBrief;
  isMine: boolean;
  type: MessageType;
  body: string | null;
  duration: number | null;
  attachment?: { name: string; mime: string; size: number; url: string };
  status: "sent" | "read" | null;
  /** Cleared by a moderator after a report. */
  removed?: boolean;
  createdAt: string;
};

export type ProposalStatus = "pending" | "accepted" | "declined" | "withdrawn";

export type Proposal = {
  id: number;
  projectId: number;
  amount: number;
  currency: string;
  deliveryDays: number;
  message: string;
  status: ProposalStatus;
  freelancer?: UserBrief & { jobTitle: string | null; rating: number | null; reviewsCount: number | null };
  team?: {
    id: number;
    name: string;
    members: { userId: number; fullName: string; roleTitle: string | null; sharePercent: number }[];
  } | null;
  project?: Project;
  createdAt: string;
};

export type Profile = {
  id: number;
  type: "freelancer" | "influencer";
  jobTitle: string;
  bio: string | null;
  rating: number;
  reviewsCount: number;
  countryId: number | null;
  cityId: number | null;
  country: string | null;
  city: string | null;
  isFeatured: boolean;
  skills?: string[];
  languages?: { name: string; level: "native" | "fluent" | "good" | "basic" }[];
  experiences?: { title: string; company: string; from: string; to: string | null; description?: string | null }[];
  educations?: { school: string; degree: string; from: number; to: number | null }[];
  certificates?: { name: string; issuer: string; year: number; url?: string | null }[];
  channels?: Channel[];
  portfolio?: PortfolioItem[];
};

type Channel = { platform: string; handle: string; url?: string | null; followers: number; engagementRate?: number | null };

export type PortfolioItem = { id: number; title: string; description: string | null; imageUrl: string; link: string | null };

export type Review = {
  id: number;
  rating: number;
  comment: string | null;
  /** The reviewed freelancer's answer (no stars). */
  reply?: string | null;
  repliedAt?: string | null;
  reviewer?: UserBrief;
  revieweeId: number;
  project?: { id: number; title: string };
  createdAt: string;
};

export type PublicProfile = {
  user: UserBrief & { lastSeenAt: string | null; memberSince: string; verified: { email: boolean; phone: boolean; identity: boolean } };
  profile: Profile | null;
  stats: { completedJobs: number; ongoingJobs: number; postedProjects: number; completedProjects: number; rating: number; reviewsCount: number };
  reviews: Review[];
  openProjects: Project[];
  medals: { code: string; name: string; awardedAt: string }[];
  isMe: boolean;
};

export type ReportTarget = "user" | "project" | "portfolio" | "review" | "message" | "proposal" | "team";

export type ContentReport = {
  id: number;
  targetType: ReportTarget;
  targetId: number;
  reason: string;
  details: string | null;
  status: "open" | "actioned" | "dismissed";
  resolutionNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

export type TeamMemberStatus = "invited" | "accepted" | "declined" | "expired";

type TeamBlocker = "too_few_members" | "awaiting_acceptances" | "invitations_not_accepted" | "lead_share_too_low";

export type Team = {
  id: number;
  name: string;
  description: string | null;
  status: "draft" | "active" | "disbanded";
  owner: UserBrief;
  members: {
    id: number;
    user: { id: number; fullName: string; avatarUrl: string | null; jobTitle: string | null; rating: number | null };
    roleTitle: string | null;
    sharePercent: number;
    status: TeamMemberStatus;
    isLead: boolean;
    expiresAt: string | null;
  }[];
  readiness: { ready: boolean; blockers: TeamBlocker[] };
  myMembership: { id: number; status: TeamMemberStatus; isLead: boolean } | null;
  publishedAt: string | null;
  createdAt: string;
};

export type TeamInvitation = {
  id: number;
  team: { id: number; name: string; description: string | null };
  invitedBy: UserBrief;
  roleTitle: string | null;
  sharePercent: number;
  status: TeamMemberStatus;
  invitedAt: string;
  expiresAt: string | null;
};

export type SearchType = "all" | "projects" | "influencer_requests" | "influencers" | "freelancers";

export type SearchAll = {
  projects: Project[];
  influencerRequests: Project[];
  influencers: ProfileCard[];
  freelancers: ProfileCard[];
};

export type PaymentMethod = {
  id: number;
  type: "card" | "paypal";
  brand: "visa" | "mastercard" | "amex" | "mada" | "other" | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
  holderName: string | null;
  email: string | null;
  isDefault: boolean;
  createdAt: string;
};

export type WalletBalance = {
  currency: string;
  available: number;
  inEscrow: number;
  incoming: number;
  pendingWithdrawals: number;
};

export type LedgerEntry = {
  id: number;
  type: string;
  label: string;
  amount: number;
  currency: string;
  balanceAfter: number;
  reference: { type: string; id: number } | null;
  /** `completed`, or a withdrawal request's state. */
  status: "completed" | "pending" | "paid" | "rejected" | "cancelled";
  createdAt: string;
};

export type Deposit = {
  id: number;
  amount: number;
  currency: string;
  method: string;
  status: "pending" | "succeeded" | "failed";
  checkoutUrl: string | null;
  failureReason?: string | null;
  paidAt: string | null;
  createdAt: string;
};

export type Withdrawal = {
  id: number;
  amount: number;
  fee: number;
  currency: string;
  method: "bank_transfer" | "paypal";
  destination: string;
  status: "pending" | "paid" | "rejected" | "cancelled";
  payoutReference: string | null;
  rejectReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

export type MilestoneStatus = "pending" | "funded" | "submitted" | "disputed" | "released" | "refunded";

export type Milestone = {
  id: number;
  escrowId: number;
  position: number;
  title: string;
  amount: number;
  status: MilestoneStatus;
  dueDate: string | null;
  refunded: number;
  fee: number;
  submissionNote: string | null;
  /** Links handed in with the delivery (influencer requests: the published posts). */
  deliveryLinks: string[];
  changesNote: string | null;
  fundedAt: string | null;
  submittedAt: string | null;
  releasedAt: string | null;
};

export type SplitStatus = "pending" | "approved" | "objected";

export type Escrow = {
  id: number;
  projectId: number;
  currency: string;
  status: "awaiting_funding" | "active" | "completed" | "cancelled";
  client?: UserBrief;
  project?: { id: number; title: string };
  totals: { total: number; held: number; released: number; refunded: number };
  milestones: Milestone[];
  payees: { userId: number; fullName: string; avatarUrl: string | null; sharePercent: number; isLead: boolean; splitStatus: SplitStatus; splitNote: string | null }[];
  splitApproved: boolean;
  tips: { id: number; amount: number; note: string | null; createdAt: string }[];
  createdAt: string;
};

export type KycStatus = "none" | "pending" | "approved" | "rejected" | "needs_update";

export type KycSubmission = {
  id: number;
  status: Exclude<KycStatus, "none">;
  documentType: "national_id" | "passport" | "driver_license";
  documentNumber: string;
  fullName: string;
  dateOfBirth: string;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
};

export type DisputeStatus = "open" | "under_review" | "resolved" | "withdrawn";

export type DisputeEntry = {
  id: number;
  kind: "message" | "system" | "admin_note" | "appeal";
  author: { id: number; fullName: string; avatarUrl: string | null; isAdmin: boolean } | null;
  body: string | null;
  attachment?: { name: string; mime: string; size: number; url: string };
  createdAt: string;
};

export type Dispute = {
  id: number;
  caseNumber: string;
  status: DisputeStatus;
  reason: string;
  description: string;
  openedBy?: UserBrief;
  against?: UserBrief;
  milestone?: { id: number; title: string; amount: number; status: MilestoneStatus };
  project?: { id: number; title: string };
  currency?: string;
  resolution: "client_refund" | "freelancer_payout" | "split" | null;
  clientPercent: number | null;
  resolutionNote: string | null;
  assignedTo?: UserBrief | null;
  permissions: { canPost: boolean; canWithdraw: boolean; canConcede: boolean; canResolve: boolean; canAppeal?: boolean };
  /** Appeals against the decision (settled disputes only). */
  appeals?: DisputeAppeal[];
  timeline?: DisputeEntry[];
  createdAt: string;
  resolvedAt: string | null;
};

/** A footer link column set by the admins (Site settings), in both languages; links are site paths or https addresses. */
export type FooterColumn = { titleEn: string; titleAr: string; links: { labelEn: string; labelAr: string; href: string }[] };

export type PublicSiteSettings = {
  nameEn: string;
  nameAr: string;
  taglineEn: string | null;
  taglineAr: string | null;
  logoUrl: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  addressEn: string | null;
  addressAr: string | null;
  social: Partial<Record<"x" | "facebook" | "instagram" | "linkedin" | "youtube" | "tiktok" | "snapchat", string>>;
  apps: Partial<Record<"android" | "ios", string>>;
  /** Replaces the footer's built-in link columns; null keeps them. */
  footer?: FooterColumn[] | null;
  maintenance: { enabled: boolean; messageEn: string; messageAr: string; endsAt: string | null };
  uploads: { avatarMb: number; portfolioMb: number; documentMb: number; chatMb: number; attachmentTypes: string[] };
  /** Default search-engine description per language; null means the built-in text. */
  seo?: { descriptionEn: string | null; descriptionAr: string | null };
  /** Card payments: the Moyasar publishable key of the mode in use (null: cards off) and that mode. */
  payments?: { moyasarPublishableKey: string | null; mode: "test" | "live" | null };
  depositMethods: string[];
  withdrawalMethods: string[];
};

type DisputeAppeal = {
  id: number;
  user: UserBrief | null;
  reason: string;
  status: "pending" | "upheld" | "overturned";
  decisionNote: string | null;
  adjustment: number | null;
  adjustmentTo: "client" | "freelancer" | null;
  createdAt: string;
  decidedAt: string | null;
};

export type PointsSummary = {
  balance: number;
  /** `times`: how often the action has paid out so far (repeatable ones show their count). */
  earn: { reason: string; label: string; points: number; once: boolean; done: boolean; times?: number }[];
  data: { id: number; amount: number; reason: string; label: string; createdAt: string }[];
  meta: Paginated<unknown>["meta"];
};

export type Medal = { code: string; name: string; description: string; current: number; target: number; earned: boolean; awardedAt: string | null };

export type DrawPrize = { rank: number; name: string; kind: "cash" | "item"; value: number | null; currency: string | null };

export type Draw = {
  id: number;
  title: string;
  status: "open" | "drawn";
  isOpen: boolean;
  ticketCost: number;
  maxTicketsPerUser: number | null;
  startsAt: string;
  drawAt: string;
  drawnAt: string | null;
  prizes: DrawPrize[];
  totals: { tickets: number; players: number };
  me: {
    points: number;
    tickets: number;
    chance: number;
    won: { id: number; rank: number; prize: DrawPrize; claimedAt: string | null; claimMethod: string | null } | null;
  } | null;
};

export type DrawHistoryItem = {
  id: number;
  title: string;
  drawnAt: string;
  players: number;
  tickets: number;
  winners: { rank: number; prize: DrawPrize; user: { id: number; fullName: string; avatarUrl: string | null } }[];
};

export type AffiliateSummary = {
  code: string;
  link: string;
  stats: { visits: number; signups: number; qualified: number; conversionRate: number };
  earnings: { currency: string; amount: number }[];
  tier: { code: string; min: number; percent: number };
  nextTier: { code: string; percent: number; referralsNeeded: number } | null;
  tiers: { code: string; min: number; percent: number }[];
  monthly: { month: string; amount: number }[];
};

export type CampaignStatus = "draft" | "active" | "paused" | "completed" | "cancelled";

export type CampaignFilters = {
  block_bots: boolean;
  unique_window_hours: number;
  max_visits_per_promoter_per_hour: number;
  allowed_countries: string[];
};

export type CampaignPromoter = {
  id: number;
  campaign?: { id: number; title: string; status: CampaignStatus; isRunning: boolean; rewardPerVisit: number; currency: string };
  user?: UserBrief;
  code: string;
  link: string;
  validVisits: number;
  rejectedVisits: number;
  earned: number;
  joinedAt: string;
};

type CampaignStats = {
  visits: number;
  validVisits: number;
  rejectedVisits: number;
  validRate?: number;
  promoters?: number;
  rejections?: { reason: string; label: string; count: number }[];
  topPromoters?: CampaignPromoter[];
};

export type Campaign = {
  id: number;
  title: string;
  description: string | null;
  status: CampaignStatus;
  isRunning: boolean;
  owner?: UserBrief;
  target: { type: "project" | "profile"; id: number; path: string };
  currency: string;
  budget: number;
  spent: number;
  remaining: number;
  costPerVisit: number;
  rewardPerVisit: number;
  feePercent: number;
  filters: CampaignFilters;
  stats?: CampaignStats;
  startsAt: string | null;
  endsAt: string | null;
  closedAt: string | null;
  createdAt: string;
};

export type CampaignVisit = {
  id: number;
  status: "valid" | "rejected";
  rejectReason: string | null;
  rejectLabel: string | null;
  promoter?: { id: number; fullName: string };
  visitor: string;
  country: string | null;
  referrer: string | null;
  reward: number;
  createdAt: string;
};

export type PromoterDashboard = {
  totals: { validVisits: number; rejectedVisits: number; earned: { currency: string; amount: number }[] };
  links: CampaignPromoter[];
  daily: { date: string; visits: number }[];
};

export type FavoriteIds = { projects: number[]; profiles: number[] };

export type SitePageSummary = { slug: string; section: "about" | "help" | "legal"; title: string; updatedAt: string | null };

export type SitePage = SitePageSummary & {
  body: string;
  /** Admin-written search title and description (null: the page title and the start of the text), and noindex. */
  seo?: { title: string | null; description: string | null; noindex: boolean };
};

/** A request to change (price / delivery time) or cancel an accepted offer, answered by the other side. */
export type AgreementChange = {
  id: number;
  projectId: number;
  type: "change" | "cancel";
  amount: number | null;
  deliveryDays: number | null;
  reason: string;
  status: "pending" | "accepted" | "declined" | "withdrawn";
  requester: { id: number; fullName: string };
  responder: { id: number; fullName: string } | null;
  responseNote: string | null;
  /** The viewer made this request (and can withdraw it). */
  mine: boolean;
  respondedAt: string | null;
  createdAt: string;
};
