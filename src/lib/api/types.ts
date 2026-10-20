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

export type AccountStatus = "connected" | "expiring" | "expired" | "disconnected"

export type CapabilityFeature =
  | "publish"
  | "delete_post"
  | "comments_read"
  | "comments_reply"
  | "dm_read"
  | "dm_reply"
  | "insights_account"
  | "insights_posts"

export type CapabilityState =
  | { state: "available"; note?: string }
  | { state: "needs_reauthorization"; missingScopes: string[]; note?: string }
  | { state: "not_connected"; note?: string }
  | { state: "unsupported"; reason: string }

export type SocialAccount = {
  brandId: string
  network: NetworkId
  status: AccountStatus
  handle: string | null
  followers: number | null
  connectedAt: string | null
  /** What this connection can do right now, as resolved by the service. */
  capabilities?: Record<CapabilityFeature, CapabilityState>
  /** False for networks that aren't integrated yet; they can't be connected. */
  available?: boolean
  /** Pinterest only: this connection uses the Pinterest API sandbox (app review demos). */
  testMode?: "sandbox" | null
  /** Pinterest only: whether connecting through the sandbox is offered. */
  sandboxAvailable?: boolean
  unavailableReason?: string | null
  /** Whether this account feeds the inbox and analytics. */
  preferences?: { inbox: boolean; analytics: boolean }
  /** When the inbox and analytics last synced, and the last problem if any. */
  sync?: { inboxAt: string | null; inboxError: string | null; analyticsAt: string | null; analyticsError: string | null }
}

/* Posts -------------------------------------------------------------------- */

/**
 * `publishing` = delivery in progress or waiting for an automatic retry; `partial` = some networks
 * published and others failed; `failed` = every network failed.
 */
export type PostStatus = "draft" | "scheduled" | "publishing" | "published" | "partial" | "failed"

/** Statuses a client may ask for when saving. "published" means publish now. */
export type PostInputStatus = "draft" | "scheduled" | "published"

export type PostMedia = {
  id: string
  name: string
  url: string
  mimeType?: string
}

export type DeliveryStatus = "pending" | "publishing" | "published" | "failed" | "deleted"

export type PostDelivery = {
  network: NetworkId
  status: DeliveryStatus
  externalUrl: string | null
  /** Caveat on a successful delivery, e.g. TikTok inbox hand-off. */
  note: string | null
  error: string | null
  errorCode: string | null
  attempts: number
  publishedAt: string | null
  nextAttemptAt: string | null
  /** Whether the platform's API lets us delete this post. */
  canRemove: boolean
}

export type Post = {
  id: string
  brandId: string
  networks: NetworkId[]
  body: string
  /** Per-network caption overrides; falls back to `body`. */
  overrides: Partial<Record<NetworkId, string>>
  /** Per-network publish options, e.g. `{ pinterest: { boardId, link } }`. */
  options: Record<string, Record<string, unknown>>
  media: PostMedia[]
  status: PostStatus
  deliveries: PostDelivery[]
  /** ISO timestamp. Required for scheduled posts. */
  scheduledAt: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type PostInput = Pick<Post, "networks" | "body" | "overrides" | "media" | "scheduledAt"> & {
  status: PostInputStatus
  options?: Post["options"]
}

export type PostListParams = {
  /** Inclusive ISO range on `scheduledAt` / `publishedAt`. */
  from?: string
  to?: string
  /** One status or several, comma-separated. */
  status?: string
}

export type PublishLogEntry = {
  id: string
  network: NetworkId | null
  event: string
  message: string
  at: string
}

export type PinterestBoard = { id: string; name: string; privacy: string | null }

/* Inbox -------------------------------------------------------------------- */

export type ConversationKind = "comment" | "dm"

export type ConversationStatus = "open" | "pending" | "done"

export type Contact = {
  name: string
  initials: string
  color: string
  avatarUrl: string | null
}

export type ChatMessage = {
  id: string
  from: "contact" | "brand"
  /** Sender name when it differs from the conversation contact (comment threads). */
  authorName: string | null
  text: string
  sentAt: string
}

export type ConversationSummary = {
  id: string
  brandId: string
  accountId: string | null
  network: NetworkId
  kind: ConversationKind
  contact: Contact
  /** Post the comment belongs to, for comment threads. */
  postTitle: string | null
  postUrl: string | null
  status: ConversationStatus
  unread: boolean
  assigneeId: string | null
  updatedAt: string
  messageCount: number
  lastMessage: { from: "contact" | "brand"; text: string; sentAt: string } | null
}

export type InboxNote = { id: string; authorId: string; text: string; createdAt: string }

export type Conversation = ConversationSummary & {
  messages: ChatMessage[]
  notes: InboxNote[]
  /** Whether a reply can be sent right now, and why not. */
  reply: { allowed: true } | { allowed: false; reason: string }
}

/** Per connected account: what the inbox can read, and the last sync result. */
export type InboxAccountState = {
  accountId: string
  network: NetworkId
  handle: string | null
  status: AccountStatus
  syncedAt: string | null
  syncError: string | null
  comments: CapabilityState
  dms: CapabilityState
}

export type ConversationPage = {
  items: ConversationSummary[]
  nextCursor: string | null
  /** Open or pending conversations with unread messages, ignoring filters. */
  unreadTotal: number
  accounts: InboxAccountState[]
}

export type ConversationFilters = {
  network?: NetworkId
  accountId?: string
  kind?: ConversationKind
  status?: ConversationStatus
  unread?: boolean
  assigneeId?: string
  q?: string
  limit?: number
  cursor?: string
}

export type SyncOutcome = {
  accountId: string
  network: NetworkId
  status: "synced" | "skipped" | "failed"
  imported: number
  newMessages: number
  message?: string
}

export type WorkspaceMemberSummary = { id: string; name: string; email: string }

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
  /** Last day of the window as yyyy-MM-dd (UTC). Defaults to today. */
  end?: string
  network?: NetworkId
  accountId?: string
}

export type MetricFormat = "number" | "percent"

/** A metric for a period. `value: null` means the platform did not report it, which is not the same as 0. */
export type Metric = {
  id: string
  label: string
  format: MetricFormat
  value: number | null
  previous: number | null
  /** Percent change vs the previous period; null when either side is unknown. */
  change: number | null
  /** Why it is unavailable, or how an aggregate was computed. */
  note?: string
}

export type SeriesPoint = { date: string; value: number }

export type MetricSeriesId = "followers" | "reach" | "views" | "profile_views" | "clicks" | "accounts_engaged"

export type AccountReport = {
  accountId: string
  network: NetworkId
  handle: string | null
  status: AccountStatus
  syncedAt: string | null
  syncError: string | null
  /** First day a follower snapshot exists; growth can only be measured from here. */
  trackingSince: string | null
  followers: { value: number | null; asOf: string | null; growth: number | null; growthRate: number | null; note?: string }
  metrics: Metric[]
  engagement: {
    rate: number | null
    previousRate: number | null
    change: number | null
    interactions: number | null
    basis: "reach" | "views" | "followers" | null
    posts: number
    note?: string
  }
  publishedPosts: number | null
  publishedPostsPrevious: number | null
  interactions: Partial<Record<string, number | null>>
  series: Partial<Record<MetricSeriesId, SeriesPoint[]>>
  /** Per-metric reasons the last collection could not report something. */
  unavailable: Record<string, string>
}

export type TopPost = {
  id: string
  network: NetworkId
  handle: string | null
  title: string
  permalink: string | null
  mediaType: string | null
  publishedAt: string
  interactions: number | null
  engagementRate: number | null
  engagementBasis: "reach" | "views" | "followers" | null
  metrics: Partial<Record<string, number>>
}

export type DemographicItem = { label: string; value: number; share: number }
export type DemographicDimension = "age" | "gender" | "country" | "city"

export type BestTimes = {
  days: string[]
  slots: string[]
  values: (number | null)[][]
  best: { day: string; slot: string }
  basedOnPosts: number
}

export type AnalyticsReport = {
  range: { start: string; end: string; days: number }
  previousRange: { start: string; end: string; days: number }
  generatedAt: string
  kpis: Metric[]
  accounts: AccountReport[]
  topPosts: TopPost[]
  /** Posts published per day; null when no post data has been synced. */
  publishing: { date: string; count: number }[] | null
  demographics: Partial<Record<DemographicDimension, DemographicItem[]>>
  /** Null until enough posts exist to say anything. */
  bestTimes: BestTimes | null
  /** Connected accounts whose network offers no analytics API, with the reason. */
  unsupported: { accountId: string; network: NetworkId; handle: string | null; reason: string }[]
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

export type ReportSection = "summary" | "networks" | "trends" | "posts" | "audience"
export type ReportFrequency = "weekly" | "monthly"

export type ReportSchedule = {
  id: string
  brandId: string
  name: string
  frequency: ReportFrequency
  /** 1 = Monday ... 7 = Sunday. */
  weekday: number
  dayOfMonth: number
  /** Hour of day in the brand's timezone. */
  hour: number
  rangeDays: number
  /** Empty means every section. */
  sections: ReportSection[]
  recipients: string[]
  enabled: boolean
  nextRunAt: string
  lastSentAt: string | null
  lastError: string | null
}

export type ReportScheduleInput = Pick<ReportSchedule, "name" | "frequency" | "recipients"> &
  Partial<Pick<ReportSchedule, "weekday" | "dayOfMonth" | "hour" | "rangeDays" | "sections" | "enabled">>

export type ReportPdfParams = { range?: number; end?: string; network?: NetworkId; sections?: ReportSection[] }

export type TikTokProfile = {
  displayName: string | null
  username: string | null
  avatarUrl: string | null
  bio: string | null
  profileUrl: string | null
  verified: boolean
  followers: number | null
  following: number | null
  likes: number | null
  videoCount: number | null
}

export type TikTokVideo = {
  id: string
  title: string
  coverUrl: string | null
  shareUrl: string | null
  createdAt: string | null
  views: number | null
  likes: number | null
  comments: number | null
}
