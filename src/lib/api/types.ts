/**
 * Domain types shared by the API layer, query hooks, and UI.
 * Keep these aligned with the backend service's response shapes.
 */
import type { BillingCycle, PlanId } from "@/config/pricing"
import type { NetworkId } from "@/config/networks"

export type { PlanId }

/* Workspace ---------------------------------------------------------------- */

export type Brand = {
  id: string
  name: string
  handle: string
  website: string
  industry: string
  timezone: string
  /**
   * Set when the plan includes fewer brands than the workspace has. Locked brands
   * stay readable but can't be edited, posted from, or connected until upgrade.
   */
  locked?: boolean
}

export type Profile = {
  name: string
  email: string
}

export type NotificationPrefKey =
  | "newDm"
  | "newComment"
  | "postPublished"
  | "postFailed"
  | "connectionExpiring"
  | "weeklyReport"

export type NotificationPrefs = Record<NotificationPrefKey, boolean>

export type Workspace = {
  brands: Brand[]
  /** Empty string when no brands exist (fresh / deleted workspace). */
  activeBrandId: string
  profile: Profile
  notificationPrefs: NotificationPrefs
}

/* Accounts ----------------------------------------------------------------- */

export type AccountStatus = "connected" | "expiring" | "disconnected"

export type SocialAccount = {
  brandId: string
  network: NetworkId
  status: AccountStatus
  handle: string | null
  followers: number | null
  connectedAt: string | null
}

/* Posts -------------------------------------------------------------------- */

export type PostStatus = "draft" | "scheduled" | "published"

export type PostMedia = {
  id: string
  name: string
  /** Data URL in the mock layer; a CDN URL once uploads go to the service. */
  url: string
}

export type Post = {
  id: string
  brandId: string
  networks: NetworkId[]
  body: string
  /** Per-network caption overrides; falls back to `body`. */
  overrides: Partial<Record<NetworkId, string>>
  media: PostMedia[]
  status: PostStatus
  /** ISO timestamp. Required for scheduled posts. */
  scheduledAt: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type PostInput = Pick<Post, "networks" | "body" | "overrides" | "media" | "status" | "scheduledAt">

export type PostListParams = {
  /** Inclusive ISO range on `scheduledAt` / `publishedAt`. */
  from?: string
  to?: string
  status?: PostStatus
}

/* Inbox -------------------------------------------------------------------- */

export type ConversationKind = "comment" | "dm"

export type ConversationStatus = "open" | "done"

export type Contact = {
  name: string
  initials: string
  color: string
}

export type ChatMessage = {
  id: string
  from: "contact" | "brand"
  text: string
  sentAt: string
}

export type Conversation = {
  id: string
  brandId: string
  network: NetworkId
  kind: ConversationKind
  contact: Contact
  /** Post the comment belongs to, for comment threads. */
  postTitle: string | null
  status: ConversationStatus
  unread: boolean
  updatedAt: string
  messages: ChatMessage[]
}

/* Notifications ------------------------------------------------------------ */

export type AppNotification = {
  id: string
  title: string
  body: string
  href: string
  createdAt: string
  read: boolean
}

/* Analytics ---------------------------------------------------------------- */

/** Length of the reporting window in days (1–365). */
export type AnalyticsRange = number

export type AnalyticsParams = {
  range: AnalyticsRange
  /** Last day of the window as yyyy-MM-dd. Defaults to today. */
  end?: string
}

export type NetworkAnalyticsParams = AnalyticsParams & {
  network: NetworkId
}

export type StatFormat = "number" | "percent" | "duration" | "rating" | "currency"

/** A single labelled metric with its change against the previous period. */
export type Stat = {
  id: string
  label: string
  /** Seconds for `duration`, 0–5 for `rating`, percent points for `percent`, US dollars for `currency`. */
  value: number
  format: StatFormat
  /** Change vs. the previous period, in percent. */
  change: number
}

export type Kpi = Stat & {
  series: number[]
}

export type TopPost = {
  id: string
  network: NetworkId
  title: string
  publishedAt: string
  reach: number
  engagementRate: number
  clicks: number
}

export type TimelinePoint = {
  /** Short axis label. */
  label: string
  /** Longer description for tooltips, e.g. "Thu, Oct 9". */
  detail: string
  value: number
}

/** One bucket of a per-network stacked chart. */
export type StackedPoint = {
  label: string
  detail: string
  values: Partial<Record<NetworkId, number>>
}

export type BreakdownItem = {
  label: string
  /** Magnitude used for bar length / donut share. */
  value: number
  /** Text shown next to the label, e.g. "46%". */
  display: string
}

/** A distribution (traffic sources, formats, audience…) rendered as bars or a donut. */
export type Breakdown = {
  id: string
  title: string
  description?: string
  variant: "bars" | "donut"
  items: BreakdownItem[]
}

/** Engagement intensity (0–100) by weekday and time of day. */
export type Heatmap = {
  days: string[]
  slots: string[]
  values: number[][]
  best: { day: string; slot: string }
}

export type Insight = {
  id: string
  tone: "positive" | "neutral" | "attention"
  title: string
  body: string
  network?: NetworkId
}

/** One row of the cross-network comparison table. */
export type NetworkRow = {
  network: NetworkId
  status: AccountStatus
  followers: number
  followerGrowth: number
  /** Follower growth as a percent of the starting audience. */
  growthRate: number
  reach: number
  impressions: number
  engagementRate: number
  clicks: number
  posts: number
  /** Share of total reach across all networks, 0–100. */
  reachShare: number
}

/** Combined analytics across every connected network. */
export type AnalyticsSummary = {
  kpis: Kpi[]
  impressions: TimelinePoint[]
  /** Impressions per bucket, split by network. */
  timeline: StackedPoint[]
  audience: { network: NetworkId; followers: number; share: number }[]
  networks: NetworkRow[]
  contentTypes: Breakdown
  /** Follower-weighted demographics across connected networks. */
  demographics: {
    age: Breakdown | null
    gender: Breakdown | null
    countries: Breakdown | null
    cities: Breakdown | null
  }
  heatmap: Heatmap
  insights: Insight[]
  topPosts: TopPost[]
}

/**
 * Earnings a network reports on top of its audience metrics (YouTube today).
 * Platforms only share revenue for monetized accounts, so there are two shapes:
 * the figures, or the reason there aren't any. All amounts are estimates in USD.
 */
export type Monetization =
  | {
      status: "monetized"
      kpis: Kpi[]
      timelineTitle: string
      timeline: TimelinePoint[]
      /** Revenue split by source; item values are US dollars. */
      breakdowns: Breakdown[]
    }
  | {
      status: "not_monetized"
      /** What the account still needs before the network reports earnings. */
      reason: string
    }

/** Analytics for a single network, with metrics that only make sense there. */
export type NetworkAnalytics = {
  network: NetworkId
  status: AccountStatus
  handle: string | null
  followers: number
  /** Names of the metrics this network reports, shown before it is connected. */
  trackedMetrics: string[]
  kpis: Kpi[]
  timelineTitle: string
  timeline: TimelinePoint[]
  highlights: Stat[]
  breakdowns: Breakdown[]
  /** Present only for networks that report earnings. */
  monetization?: Monetization
  heatmap: Heatmap
  insights: Insight[]
  topPosts: TopPost[]
}

/* Billing ------------------------------------------------------------------ */

export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled"

export type InvoiceStatus = "paid" | "open" | "failed"

export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "other"

export type PaymentMethod = {
  brand: CardBrand
  last4: string
  expMonth: number
  expYear: number
}

export type BillingDetails = {
  companyName: string
  billingEmail: string
  country: string
  taxId: string
}

export type ScheduledPlanChange = {
  planId: PlanId
  cycle: BillingCycle
  brandAllowance: number
  effectiveAt: string
}

export type Subscription = {
  planId: PlanId
  cycle: BillingCycle
  /** Purchased brand slots (Free = 1). */
  brandAllowance: number
  status: SubscriptionStatus
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  /** Brand that stays active on Free once a scheduled cancellation takes effect. */
  keepBrandId?: string | null
  scheduledChange: ScheduledPlanChange | null
  trialEndsAt: string | null
}

export type Invoice = {
  id: string
  number: string
  description: string
  /** Amount in USD (same units as `config/pricing`). */
  amount: number
  currency: "usd"
  status: InvoiceStatus
  issuedAt: string
  paidAt: string | null
}

export type UsageMeter = {
  label: string
  used: number
  /** `null` means unlimited. */
  limit: number | null
  unit: string
}

export type BillingUsage = {
  brands: UsageMeter
  scheduledPosts: UsageMeter
  connectedNetworks: UsageMeter
  analyticsHistory: UsageMeter
}

export type Billing = {
  subscription: Subscription
  paymentMethod: PaymentMethod | null
  billingDetails: BillingDetails
  invoices: Invoice[]
}

/** Full billing payload returned to the UI (includes derived usage). */
export type BillingSnapshot = Billing & {
  usage: BillingUsage
}
