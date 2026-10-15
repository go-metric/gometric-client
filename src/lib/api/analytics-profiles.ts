import type { NetworkId } from "@/config/networks"
import type { StatFormat } from "@/lib/api/types"

/**
 * Mock stand-in for what each network's reporting API would return.
 * Every number is derived from these base metrics so the combined dashboard
 * and the per-network dashboards always agree with each other.
 */
export type Metrics = {
  followers: number
  reach: number
  impressions: number
  engagements: number
  clicks: number
  /** Net new followers in the period. */
  growth: number
  /** Engagement rate, percent. */
  engagementRate: number
  /** `range / 28`, for metrics that accumulate over the period. */
  scale: number
}

type Rand = () => number

export type StatSpec = {
  id: string
  label: string
  format?: StatFormat
  value: (m: Metrics, r: Rand) => number
}

export type BreakdownSpec = {
  id: string
  title: string
  description?: string
  variant: "bars" | "donut"
  items: { label: string; weight: number }[]
}

/** How a network that shares earnings (YouTube) turns views into revenue in the mock. */
export type MonetizationSpec = {
  /** Creator revenue per 1,000 views (RPM) in USD, as a [low, high] range. */
  rpm: [number, number]
  /** Share of views that play an ad. */
  monetizedRate: [number, number]
  /** Audience size below which the account isn't eligible to earn. */
  minFollowers: number
  /** Shown when the account is below that bar. */
  ineligibleReason: string
  /** Revenue by source; weights are relative. */
  sources: BreakdownSpec
}

export type NetworkProfile = {
  reachPerFollower: number
  impressionsPerReach: number
  engagementBase: number
  clicksPerFollower: number
  growthRate: number
  /** Heading for the main time series, e.g. "Video views". */
  timelineTitle: string
  /** Weekday (Mon–Sun) and time-of-day weights that shape the best-time heatmap. */
  peakDays: number[]
  peakSlots: number[]
  kpis: StatSpec[]
  highlights: StatSpec[]
  breakdowns: BreakdownSpec[]
  monetization?: MonetizationSpec
}

const pct = (r: Rand, min: number, max: number) => Math.round((min + r() * (max - min)) * 10) / 10
const int = (n: number) => Math.round(n)

/** Breakdown ids that describe who the audience is (shown on overview + connect empty state). */
export const DEMOGRAPHIC_IDS = new Set(["age", "countries", "cities", "gender"])

const age = (weights: [number, number, number, number, number]): BreakdownSpec => ({
  id: "age",
  title: "Audience age",
  description: "Who you reach, by age group",
  variant: "bars",
  items: ["13–17", "18–24", "25–34", "35–44", "45+"].map((label, i) => ({ label, weight: weights[i]! })),
})

const countries = (items: [string, number][]): BreakdownSpec => ({
  id: "countries",
  title: "Top countries",
  description: "Where your audience is based",
  variant: "bars",
  items: items.map(([label, weight]) => ({ label, weight })),
})

const cities = (items: [string, number][]): BreakdownSpec => ({
  id: "cities",
  title: "Top cities",
  description: "Cities with the most people in your audience",
  variant: "bars",
  items: items.map(([label, weight]) => ({ label, weight })),
})

const gender = (female: number, male: number, other = Math.max(0, 100 - female - male)): BreakdownSpec => ({
  id: "gender",
  title: "Audience gender",
  description: "How your audience identifies",
  variant: "donut",
  items: [
    { label: "Female", weight: female },
    { label: "Male", weight: male },
    { label: "Other", weight: other },
  ],
})

export const profiles: Record<NetworkId, NetworkProfile> = {
  instagram: {
    reachPerFollower: 11,
    impressionsPerReach: 1.35,
    engagementBase: 5.8,
    clicksPerFollower: 0.35,
    growthRate: 0.018,
    timelineTitle: "Impressions",
    peakDays: [0.8, 1, 0.9, 1, 0.85, 0.6, 0.7],
    peakSlots: [0.4, 0.7, 1, 0.6, 0.9, 0.75],
    kpis: [
      { id: "followers", label: "Followers", value: (m) => m.followers },
      { id: "reach", label: "Accounts reached", value: (m) => m.reach },
      { id: "profileVisits", label: "Profile visits", value: (m) => int(m.reach * 0.045) },
      { id: "engagement", label: "Engagement rate", format: "percent", value: (m) => m.engagementRate },
    ],
    highlights: [
      { id: "saves", label: "Saves", value: (m) => int(m.engagements * 0.14) },
      { id: "shares", label: "Shares", value: (m) => int(m.engagements * 0.11) },
      { id: "storyCompletion", label: "Story completion", format: "percent", value: (_, r) => pct(r, 74, 90) },
      { id: "reelWatch", label: "Avg. reel watch time", format: "duration", value: (_, r) => int(6 + r() * 9) },
    ],
    breakdowns: [
      {
        id: "format",
        title: "Engagement by format",
        description: "Where your interactions come from",
        variant: "bars",
        items: [
          { label: "Reels", weight: 46 },
          { label: "Carousels", weight: 24 },
          { label: "Photos", weight: 18 },
          { label: "Stories", weight: 12 },
        ],
      },
      {
        id: "audience",
        title: "Followers vs. non-followers",
        description: "Who your reach is made of",
        variant: "donut",
        items: [
          { label: "Non-followers", weight: 61 },
          { label: "Followers", weight: 39 },
        ],
      },
      age([2, 28, 38, 19, 13]),
      gender(56, 41, 3),
      countries([
        ["United States", 38],
        ["United Kingdom", 14],
        ["Canada", 9],
        ["Australia", 7],
        ["Germany", 6],
        ["Other", 26],
      ]),
      cities([
        ["New York", 12],
        ["London", 9],
        ["Los Angeles", 8],
        ["Toronto", 6],
        ["Sydney", 5],
        ["Other", 60],
      ]),
    ],
  },

  tiktok: {
    reachPerFollower: 16,
    impressionsPerReach: 1.05,
    engagementBase: 8.2,
    clicksPerFollower: 0.12,
    growthRate: 0.035,
    timelineTitle: "Video views",
    peakDays: [0.7, 0.8, 0.85, 0.9, 1, 0.95, 0.8],
    peakSlots: [0.3, 0.5, 0.7, 0.8, 1, 0.95],
    kpis: [
      { id: "views", label: "Video views", value: (m) => m.impressions },
      { id: "followers", label: "Followers", value: (m) => m.followers },
      { id: "engagement", label: "Engagement rate", format: "percent", value: (m) => m.engagementRate },
      { id: "watchTime", label: "Avg. watch time", format: "duration", value: (_, r) => int(8 + r() * 14) },
    ],
    highlights: [
      { id: "completion", label: "Full-watch rate", format: "percent", value: (_, r) => pct(r, 14, 32) },
      { id: "shares", label: "Shares", value: (m) => int(m.engagements * 0.17) },
      { id: "profileViews", label: "Profile views", value: (m) => int(m.reach * 0.06) },
      { id: "likes", label: "Likes", value: (m) => int(m.engagements * 0.72) },
    ],
    breakdowns: [
      {
        id: "traffic",
        title: "Where viewers find you",
        description: "Traffic source for video views",
        variant: "bars",
        items: [
          { label: "For You feed", weight: 71 },
          { label: "Following", weight: 11 },
          { label: "Profile", weight: 7 },
          { label: "Search", weight: 5 },
          { label: "Sounds", weight: 4 },
          { label: "Hashtags", weight: 2 },
        ],
      },
      gender(58, 40, 2),
      age([4, 41, 31, 15, 9]),
      countries([
        ["United States", 34],
        ["Brazil", 12],
        ["United Kingdom", 10],
        ["Mexico", 8],
        ["Indonesia", 7],
        ["Other", 29],
      ]),
      cities([
        ["Los Angeles", 11],
        ["São Paulo", 8],
        ["London", 7],
        ["Mexico City", 6],
        ["Jakarta", 5],
        ["Other", 63],
      ]),
    ],
  },

  youtube: {
    reachPerFollower: 9,
    impressionsPerReach: 1.4,
    engagementBase: 4.1,
    clicksPerFollower: 0.22,
    growthRate: 0.012,
    timelineTitle: "Views",
    // YouTube Partner Program: 1,000 subscribers plus watch-time or Shorts-view thresholds.
    monetization: {
      rpm: [2.8, 5.4],
      monetizedRate: [0.55, 0.72],
      minFollowers: 1000,
      ineligibleReason:
        "YouTube only reports earnings for channels in the YouTube Partner Program. You need 1,000 subscribers and either 4,000 public watch hours in the past 12 months or 10M public Shorts views in the past 90 days.",
      sources: {
        id: "revenueSources",
        title: "Revenue by source",
        description: "Where your estimated earnings come from",
        variant: "bars",
        items: [
          { label: "Ads", weight: 71 },
          { label: "YouTube Premium", weight: 13 },
          { label: "Channel memberships", weight: 8 },
          { label: "Super Chat & Stickers", weight: 5 },
          { label: "Shopping & other", weight: 3 },
        ],
      },
    },
    peakDays: [0.7, 0.75, 0.8, 0.85, 0.95, 1, 0.9],
    peakSlots: [0.3, 0.45, 0.6, 0.8, 1, 0.9],
    kpis: [
      { id: "views", label: "Views", value: (m) => m.impressions },
      { id: "watchHours", label: "Watch time (hrs)", value: (m) => int(m.impressions * 0.0042) },
      { id: "subscribers", label: "Subscribers", value: (m) => m.followers },
      { id: "ctr", label: "Impressions CTR", format: "percent", value: (_, r) => pct(r, 3.6, 8.4) },
    ],
    highlights: [
      { id: "avgView", label: "Avg. view duration", format: "duration", value: (_, r) => int(150 + r() * 210) },
      { id: "subsGained", label: "Subscribers gained", value: (m) => m.growth },
      { id: "likes", label: "Likes", value: (m) => int(m.engagements * 0.8) },
      { id: "comments", label: "Comments", value: (m) => int(m.engagements * 0.06) },
    ],
    breakdowns: [
      {
        id: "traffic",
        title: "Traffic sources",
        description: "How viewers get to your videos",
        variant: "bars",
        items: [
          { label: "Browse features", weight: 33 },
          { label: "Suggested videos", weight: 29 },
          { label: "YouTube search", weight: 21 },
          { label: "Shorts feed", weight: 9 },
          { label: "External", weight: 5 },
          { label: "Other", weight: 3 },
        ],
      },
      {
        id: "format",
        title: "Views by format",
        variant: "donut",
        items: [
          { label: "Long-form", weight: 58 },
          { label: "Shorts", weight: 34 },
          { label: "Live", weight: 8 },
        ],
      },
      {
        id: "device",
        title: "Devices",
        description: "Where your videos are watched",
        variant: "bars",
        items: [
          { label: "Mobile", weight: 62 },
          { label: "Desktop", weight: 24 },
          { label: "TV", weight: 11 },
          { label: "Tablet", weight: 3 },
        ],
      },
      age([1, 16, 32, 28, 23]),
      gender(47, 51, 2),
      countries([
        ["United States", 41],
        ["United Kingdom", 13],
        ["India", 11],
        ["Canada", 8],
        ["Germany", 6],
        ["Other", 21],
      ]),
      cities([
        ["New York", 10],
        ["London", 8],
        ["Mumbai", 7],
        ["Toronto", 5],
        ["Berlin", 4],
        ["Other", 66],
      ]),
    ],
  },

  google_business: {
    reachPerFollower: 18,
    impressionsPerReach: 1.1,
    engagementBase: 7.4,
    clicksPerFollower: 0.5,
    growthRate: 0.01,
    timelineTitle: "Profile views",
    peakDays: [1, 0.95, 0.9, 0.9, 0.95, 0.85, 0.55],
    peakSlots: [0.5, 0.9, 1, 0.9, 0.7, 0.4],
    kpis: [
      { id: "views", label: "Profile views", value: (m) => m.impressions },
      { id: "website", label: "Website clicks", value: (m) => m.clicks },
      { id: "calls", label: "Calls", value: (m) => int(m.impressions * 0.011) },
      { id: "directions", label: "Direction requests", value: (m) => int(m.impressions * 0.019) },
    ],
    highlights: [
      { id: "rating", label: "Average rating", format: "rating", value: (_, r) => pct(r, 4.3, 4.9) },
      { id: "reviews", label: "New reviews", value: (m) => int(m.reach * 0.0009) + 2 },
      { id: "responseRate", label: "Review response rate", format: "percent", value: (_, r) => pct(r, 82, 99) },
      { id: "photoViews", label: "Photo views", value: (m) => int(m.impressions * 0.7) },
    ],
    breakdowns: [
      {
        id: "found",
        title: "How customers found you",
        description: "Where your profile was viewed",
        variant: "donut",
        items: [
          { label: "Search · mobile", weight: 34 },
          { label: "Maps · mobile", weight: 31 },
          { label: "Search · desktop", weight: 20 },
          { label: "Maps · desktop", weight: 15 },
        ],
      },
      {
        id: "actions",
        title: "Customer actions",
        description: "What people did after viewing",
        variant: "bars",
        items: [
          { label: "Website visits", weight: 34 },
          { label: "Directions", weight: 29 },
          { label: "Calls", weight: 22 },
          { label: "Bookings", weight: 9 },
          { label: "Messages", weight: 6 },
        ],
      },
      {
        id: "ratings",
        title: "Review ratings",
        variant: "bars",
        items: [
          { label: "5 stars", weight: 71 },
          { label: "4 stars", weight: 17 },
          { label: "3 stars", weight: 6 },
          { label: "2 stars", weight: 3 },
          { label: "1 star", weight: 3 },
        ],
      },
      age([0, 8, 24, 33, 35]),
      gender(52, 46, 2),
      countries([
        ["United States", 48],
        ["United Kingdom", 12],
        ["Canada", 10],
        ["Australia", 8],
        ["Ireland", 5],
        ["Other", 17],
      ]),
      cities([
        ["Chicago", 14],
        ["New York", 11],
        ["London", 9],
        ["Toronto", 7],
        ["Melbourne", 6],
        ["Other", 53],
      ]),
    ],
  },

  facebook: {
    reachPerFollower: 5.5,
    impressionsPerReach: 1.6,
    engagementBase: 2.9,
    clicksPerFollower: 0.28,
    growthRate: 0.006,
    timelineTitle: "Impressions",
    peakDays: [0.75, 0.9, 1, 0.95, 0.85, 0.6, 0.65],
    peakSlots: [0.45, 0.75, 1, 0.9, 0.7, 0.5],
    kpis: [
      { id: "reach", label: "Page reach", value: (m) => m.reach },
      { id: "followers", label: "Page followers", value: (m) => m.followers },
      { id: "engagements", label: "Post engagements", value: (m) => m.engagements },
      { id: "clicks", label: "Link clicks", value: (m) => m.clicks },
    ],
    highlights: [
      { id: "videoViews", label: "Video views (3s+)", value: (m) => int(m.impressions * 0.34) },
      { id: "shares", label: "Shares", value: (m) => int(m.engagements * 0.09) },
      { id: "comments", label: "Comments", value: (m) => int(m.engagements * 0.07) },
      { id: "pageVisits", label: "Page visits", value: (m) => int(m.reach * 0.05) },
    ],
    breakdowns: [
      {
        id: "reactions",
        title: "Reactions",
        description: "How people respond to your posts",
        variant: "donut",
        items: [
          { label: "Like", weight: 58 },
          { label: "Love", weight: 21 },
          { label: "Haha", weight: 9 },
          { label: "Wow", weight: 5 },
          { label: "Care", weight: 4 },
          { label: "Sad / Angry", weight: 3 },
        ],
      },
      {
        id: "format",
        title: "Engagement by post type",
        variant: "bars",
        items: [
          { label: "Video", weight: 41 },
          { label: "Photo", weight: 28 },
          { label: "Link", weight: 17 },
          { label: "Text", weight: 14 },
        ],
      },
      age([1, 12, 27, 31, 29]),
      gender(49, 49, 2),
      countries([
        ["United States", 36],
        ["United Kingdom", 11],
        ["India", 9],
        ["Brazil", 8],
        ["Canada", 7],
        ["Other", 29],
      ]),
      cities([
        ["New York", 9],
        ["London", 7],
        ["Mumbai", 6],
        ["São Paulo", 5],
        ["Toronto", 4],
        ["Other", 69],
      ]),
    ],
  },

  x: {
    reachPerFollower: 3.2,
    impressionsPerReach: 1.9,
    engagementBase: 2.1,
    clicksPerFollower: 0.18,
    growthRate: 0.008,
    timelineTitle: "Impressions",
    peakDays: [0.95, 1, 1, 0.95, 0.8, 0.4, 0.45],
    peakSlots: [0.6, 0.9, 1, 0.8, 0.6, 0.45],
    kpis: [
      { id: "impressions", label: "Impressions", value: (m) => m.impressions },
      { id: "followers", label: "Followers", value: (m) => m.followers },
      { id: "engagement", label: "Engagement rate", format: "percent", value: (m) => m.engagementRate },
      { id: "profileVisits", label: "Profile visits", value: (m) => int(m.reach * 0.038) },
    ],
    highlights: [
      { id: "mentions", label: "Mentions", value: (m) => int(m.engagements * 0.03) },
      { id: "reposts", label: "Reposts", value: (m) => int(m.engagements * 0.17) },
      { id: "replies", label: "Replies", value: (m) => int(m.engagements * 0.11) },
      { id: "bookmarks", label: "Bookmarks", value: (m) => int(m.engagements * 0.04) },
    ],
    breakdowns: [
      {
        id: "interactions",
        title: "Engagement by type",
        description: "What people do with your posts",
        variant: "bars",
        items: [
          { label: "Likes", weight: 52 },
          { label: "Reposts", weight: 17 },
          { label: "Link clicks", weight: 12 },
          { label: "Replies", weight: 11 },
          { label: "Profile clicks", weight: 5 },
          { label: "Bookmarks", weight: 3 },
        ],
      },
      {
        id: "format",
        title: "Impressions by post type",
        variant: "donut",
        items: [
          { label: "Text", weight: 44 },
          { label: "Image", weight: 29 },
          { label: "Video", weight: 19 },
          { label: "Link", weight: 8 },
        ],
      },
      age([1, 18, 36, 27, 18]),
      gender(42, 55, 3),
      countries([
        ["United States", 40],
        ["United Kingdom", 15],
        ["India", 10],
        ["Canada", 8],
        ["Japan", 5],
        ["Other", 22],
      ]),
      cities([
        ["San Francisco", 10],
        ["London", 9],
        ["New York", 8],
        ["Bangalore", 6],
        ["Toronto", 5],
        ["Other", 62],
      ]),
    ],
  },

  linkedin: {
    reachPerFollower: 4.4,
    impressionsPerReach: 1.25,
    engagementBase: 3.9,
    clicksPerFollower: 0.6,
    growthRate: 0.02,
    timelineTitle: "Impressions",
    peakDays: [0.8, 1, 1, 0.95, 0.7, 0.2, 0.2],
    peakSlots: [0.5, 1, 0.9, 0.7, 0.45, 0.25],
    kpis: [
      { id: "impressions", label: "Impressions", value: (m) => m.impressions },
      { id: "followers", label: "Followers", value: (m) => m.followers },
      { id: "visitors", label: "Page visitors", value: (m) => int(m.reach * 0.07) },
      { id: "ctr", label: "Click-through rate", format: "percent", value: (m) => Math.round((m.clicks / Math.max(m.impressions, 1)) * 1000) / 10 },
    ],
    highlights: [
      { id: "reactions", label: "Reactions", value: (m) => int(m.engagements * 0.74) },
      { id: "comments", label: "Comments", value: (m) => int(m.engagements * 0.1) },
      { id: "reposts", label: "Reposts", value: (m) => int(m.engagements * 0.08) },
      { id: "searches", label: "Search appearances", value: (m) => int(m.reach * 0.11) },
    ],
    breakdowns: [
      {
        id: "function",
        title: "Visitors by job function",
        description: "Who is looking at your page",
        variant: "bars",
        items: [
          { label: "Marketing", weight: 24 },
          { label: "Engineering", weight: 19 },
          { label: "Sales", weight: 15 },
          { label: "Operations", weight: 12 },
          { label: "Founders & owners", weight: 10 },
        ],
      },
      {
        id: "industry",
        title: "Followers by industry",
        variant: "donut",
        items: [
          { label: "Software", weight: 28 },
          { label: "Retail", weight: 21 },
          { label: "Marketing & ads", weight: 18 },
          { label: "Finance", weight: 12 },
          { label: "Other", weight: 21 },
        ],
      },
      {
        id: "seniority",
        title: "Seniority",
        variant: "bars",
        items: [
          { label: "Senior", weight: 31 },
          { label: "Manager", weight: 22 },
          { label: "Entry", weight: 19 },
          { label: "Director+", weight: 14 },
          { label: "Other", weight: 14 },
        ],
      },
      age([0, 9, 34, 36, 21]),
      gender(44, 53, 3),
      countries([
        ["United States", 45],
        ["United Kingdom", 14],
        ["India", 12],
        ["Canada", 8],
        ["Germany", 6],
        ["Other", 15],
      ]),
      cities([
        ["New York", 11],
        ["London", 9],
        ["San Francisco", 8],
        ["Bangalore", 7],
        ["Toronto", 5],
        ["Other", 60],
      ]),
    ],
  },

  threads: {
    reachPerFollower: 2.4,
    impressionsPerReach: 1.3,
    engagementBase: 4.7,
    clicksPerFollower: 0.05,
    growthRate: 0.03,
    timelineTitle: "Views",
    peakDays: [0.8, 0.85, 0.9, 0.95, 1, 0.8, 0.75],
    peakSlots: [0.4, 0.6, 0.8, 0.9, 1, 0.9],
    kpis: [
      { id: "views", label: "Views", value: (m) => m.impressions },
      { id: "followers", label: "Followers", value: (m) => m.followers },
      { id: "engagement", label: "Engagement rate", format: "percent", value: (m) => m.engagementRate },
      { id: "replies", label: "Replies", value: (m) => int(m.engagements * 0.19) },
    ],
    highlights: [
      { id: "likes", label: "Likes", value: (m) => int(m.engagements * 0.6) },
      { id: "reposts", label: "Reposts", value: (m) => int(m.engagements * 0.13) },
      { id: "quotes", label: "Quotes", value: (m) => int(m.engagements * 0.05) },
      { id: "linkClicks", label: "Link clicks", value: (m) => m.clicks },
    ],
    breakdowns: [
      {
        id: "interactions",
        title: "Interactions",
        description: "How people respond to your threads",
        variant: "donut",
        items: [
          { label: "Likes", weight: 60 },
          { label: "Replies", weight: 19 },
          { label: "Reposts", weight: 13 },
          { label: "Quotes", weight: 8 },
        ],
      },
      {
        id: "format",
        title: "Views by post type",
        variant: "bars",
        items: [
          { label: "Text", weight: 57 },
          { label: "Image", weight: 29 },
          { label: "Video", weight: 14 },
        ],
      },
      age([2, 33, 38, 17, 10]),
      gender(54, 43, 3),
      countries([
        ["United States", 42],
        ["United Kingdom", 12],
        ["Brazil", 9],
        ["Canada", 8],
        ["Spain", 5],
        ["Other", 24],
      ]),
      cities([
        ["Los Angeles", 10],
        ["New York", 9],
        ["London", 7],
        ["São Paulo", 6],
        ["Toronto", 5],
        ["Other", 63],
      ]),
    ],
  },

  pinterest: {
    reachPerFollower: 14,
    impressionsPerReach: 1.3,
    engagementBase: 3.4,
    clicksPerFollower: 0.5,
    growthRate: 0.02,
    timelineTitle: "Impressions",
    peakDays: [0.6, 0.65, 0.7, 0.8, 0.9, 1, 1],
    peakSlots: [0.35, 0.5, 0.65, 0.8, 0.95, 1],
    kpis: [
      { id: "impressions", label: "Impressions", value: (m) => m.impressions },
      { id: "engagedAudience", label: "Engaged audience", value: (m) => int(m.reach * 0.22) },
      { id: "saves", label: "Saves", value: (m) => int(m.engagements * 0.42) },
      { id: "outbound", label: "Outbound clicks", value: (m) => m.clicks },
    ],
    highlights: [
      { id: "pinClickRate", label: "Pin click rate", format: "percent", value: (_, r) => pct(r, 0.8, 2.6) },
      { id: "closeups", label: "Closeups", value: (m) => int(m.engagements * 0.31) },
      { id: "saveRate", label: "Save rate", format: "percent", value: (_, r) => pct(r, 1.1, 3.4) },
      { id: "totalAudience", label: "Total audience", value: (m) => int(m.reach * 0.6) },
    ],
    breakdowns: [
      {
        id: "boards",
        title: "Top boards",
        description: "Boards driving the most saves",
        variant: "bars",
        items: [
          { label: "Autumn edit", weight: 31 },
          { label: "Workspace ideas", weight: 24 },
          { label: "Gift guides", weight: 19 },
          { label: "Behind the scenes", weight: 16 },
          { label: "Studio style", weight: 10 },
        ],
      },
      {
        id: "format",
        title: "Pin format",
        variant: "donut",
        items: [
          { label: "Standard", weight: 51 },
          { label: "Video", weight: 29 },
          { label: "Idea pins", weight: 20 },
        ],
      },
      gender(71, 25, 4),
      age([1, 22, 35, 26, 16]),
      countries([
        ["United States", 46],
        ["United Kingdom", 11],
        ["Canada", 9],
        ["Germany", 7],
        ["France", 5],
        ["Other", 22],
      ]),
      cities([
        ["New York", 12],
        ["Los Angeles", 10],
        ["London", 8],
        ["Toronto", 6],
        ["Berlin", 5],
        ["Other", 59],
      ]),
    ],
  },
}
