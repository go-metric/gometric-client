import { addDays, endOfDay, format, parseISO, startOfDay, subDays } from "date-fns"
import { networks, type NetworkId } from "@/config/networks"
import {
  DEMOGRAPHIC_IDS,
  profiles,
  type BreakdownSpec,
  type Metrics,
  type NetworkProfile,
  type StatSpec,
} from "@/lib/api/analytics-profiles"
import { read } from "@/lib/api/mock/db"
import type { MockDb } from "@/lib/api/mock/seed"
import type {
  AnalyticsParams,
  AnalyticsRange,
  AnalyticsSummary,
  Breakdown,
  Heatmap,
  Insight,
  Kpi,
  Monetization,
  NetworkAnalytics,
  NetworkAnalyticsParams,
  NetworkRow,
  SocialAccount,
  Stat,
  TimelinePoint,
  TopPost,
} from "@/lib/api/types"
import { formatCompact, formatCurrency } from "@/lib/format"
import { postTitle } from "@/lib/posts"

/** Deterministic pseudo-random numbers so mock charts don't jump between renders. */
function random(seed: string) {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

const round1 = (n: number) => Math.round(n * 10) / 10

/** Change versus the previous period: mostly up, with the odd small dip. Audience size never shrinks. */
function periodChange(next: () => number, id: string) {
  const change = next() * 24 - 2
  return round1(id === "followers" ? Math.abs(change) : change)
}

function trend(next: () => number, length: number, base: number, growth: number) {
  return Array.from({ length }, (_, i) => {
    const value = base * (1 + (growth * i) / length) * (0.85 + next() * 0.3)
    // Small values (rates, ratings) keep their decimals so the sparkline isn't stepped.
    return base >= 50 ? Math.round(value) : Math.round(value * 100) / 100
  })
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const SLOTS = ["6am", "9am", "12pm", "3pm", "6pm", "9pm"]

/* Per-network model -------------------------------------------------------- */

type NetworkData = {
  account: SocialAccount
  followers: number
  metrics: Metrics
  profile: NetworkProfile
  /** Impressions per bucket; sums to `metrics.impressions`. */
  series: number[]
  posts: number
  kpis: Kpi[]
  highlights: Stat[]
  heatmap: number[][]
}

type Ctx = {
  db: MockDb
  brandId: string
  range: AnalyticsRange
  /** Last day of the window. */
  today: Date
  /** Seed identity for this window, so each range gets its own stable numbers. */
  key: string
  buckets: { label: string; detail: string }[]
}

/** Up to a month is shown per day; longer windows are grouped by week. */
function makeBuckets(range: AnalyticsRange, today: Date) {
  if (range <= 31) {
    return Array.from({ length: range }, (_, i) => {
      const date = subDays(today, range - 1 - i)
      return { label: format(date, range <= 7 ? "EEE d" : "MMM d"), detail: format(date, "EEE, MMM d") }
    })
  }
  const weeks = Math.ceil(range / 7)
  return Array.from({ length: weeks }, (_, i) => {
    const end = subDays(today, (weeks - 1 - i) * 7)
    const start = subDays(end, 6)
    return { label: format(start, "MMM d"), detail: `${format(start, "MMM d")} – ${format(end, "MMM d")}` }
  })
}

function makeStat(spec: StatSpec, m: Metrics, seed: string): Stat {
  const r = random(`${seed}:${spec.id}`)
  return {
    id: spec.id,
    label: spec.label,
    value: spec.value(m, r),
    format: spec.format ?? "number",
    change: periodChange(r, spec.id),
  }
}

function makeKpi(stat: Stat, seed: string): Kpi {
  const next = random(`${seed}:${stat.id}:series`)
  return { ...stat, series: trend(next, 12, stat.value || 1, 0.4) }
}

function buildHeatmap(profile: NetworkProfile, seed: string) {
  const next = random(seed)
  return DAYS.map((_, d) =>
    SLOTS.map((_, s) => profile.peakDays[d]! * profile.peakSlots[s]! * (0.78 + next() * 0.22))
  )
}

function buildNetwork(ctx: Ctx, account: SocialAccount): NetworkData {
  const { brandId, range, today, buckets } = ctx
  const network = account.network
  const profile = profiles[network]
  const seed = `${ctx.key}:${network}`
  const r = random(`${seed}:metrics`)

  const followers = account.followers || Math.round(2_000 + r() * 7_000)
  const scale = range / 28
  const reach = Math.round(followers * profile.reachPerFollower * scale * (0.9 + r() * 0.2))
  const impressions = Math.round(reach * profile.impressionsPerReach)
  const engagementRate = round1(profile.engagementBase * (0.85 + r() * 0.3))
  const metrics: Metrics = {
    followers,
    reach,
    impressions,
    engagements: Math.round((impressions * engagementRate) / 100),
    clicks: Math.round(followers * profile.clicksPerFollower * scale * (0.85 + r() * 0.3)),
    growth: Math.round(followers * profile.growthRate * scale * (0.6 + r() * 0.8)),
    engagementRate,
    scale,
  }

  const weights = buckets.map((_, i) => (0.7 + r() * 0.6) * (1 + i / buckets.length / 2))
  const total = weights.reduce((sum, w) => sum + w, 0)
  const series = weights.map((w) => Math.round((impressions * w) / total))

  const { from, to } = windowIso(today, range)
  const posts = ctx.db.posts.filter(
    (p) =>
      p.brandId === brandId &&
      p.status === "published" &&
      p.publishedAt &&
      p.publishedAt >= from &&
      p.publishedAt <= to &&
      p.networks.includes(network)
  ).length

  return {
    account,
    followers,
    metrics,
    profile,
    series,
    posts,
    kpis: profile.kpis.map((spec) => makeKpi(makeStat(spec, metrics, seed), seed)),
    highlights: profile.highlights.map((spec) => makeStat(spec, metrics, `${seed}:hl`)),
    heatmap: buildHeatmap(profile, `${seed}:heat`),
  }
}

function buildBreakdown(spec: BreakdownSpec, seed: string): Breakdown {
  const next = random(`${seed}:${spec.id}`)
  const raw = spec.items.map((item) => item.weight * (0.92 + next() * 0.16))
  const total = raw.reduce((sum, v) => sum + v, 0)
  const shares = raw.map((v) => Math.round((v / total) * 100))
  // Absorb rounding drift in the largest slice so the parts always add to 100.
  const drift = 100 - shares.reduce((sum, v) => sum + v, 0)
  shares[shares.indexOf(Math.max(...shares))]! += drift
  return {
    id: spec.id,
    title: spec.title,
    description: spec.description,
    variant: spec.variant,
    items: spec.items.map((item, i) => ({ label: item.label, value: shares[i]!, display: `${shares[i]}%` })),
  }
}

/** Follower-weighted merge of a demographic breakdown across connected networks. */
function aggregateDemographic(accounts: NetworkData[], id: string, seed: string, limit?: number): Breakdown | null {
  const contrib = accounts
    .map((a) => {
      const spec = a.profile.breakdowns.find((b) => b.id === id)
      return spec ? { followers: a.followers, spec } : null
    })
    .filter((c): c is { followers: number; spec: BreakdownSpec } => c !== null)

  if (contrib.length === 0) return null

  const totals = new Map<string, number>()
  let weightSum = 0
  for (const { followers, spec } of contrib) {
    const itemTotal = spec.items.reduce((sum, item) => sum + item.weight, 0) || 1
    weightSum += followers
    for (const item of spec.items) {
      totals.set(item.label, (totals.get(item.label) ?? 0) + (item.weight / itemTotal) * followers)
    }
  }
  if (weightSum === 0) return null

  let ranked = [...totals.entries()]
    .map(([label, value]) => ({ label, value: (value / weightSum) * 100 }))
    .sort((a, b) => b.value - a.value)

  if (limit && ranked.length > limit) {
    const head = ranked.slice(0, limit - 1)
    const other = ranked.slice(limit - 1).reduce((sum, item) => sum + item.value, 0)
    ranked = [...head, { label: "Other", value: other }]
  }

  const shares = ranked.map((item) => Math.round(item.value))
  const drift = 100 - shares.reduce((sum, v) => sum + v, 0)
  if (shares.length > 0) shares[shares.indexOf(Math.max(...shares))]! += drift

  const template = contrib[0]!.spec
  // Keep the seed in the signature so overview and network dashboards stay in sync
  // if we later add jitter to aggregated demographics.
  void seed

  return {
    id: template.id,
    title: template.title,
    description:
      contrib.length > 1
        ? "Averaged across the networks you've connected"
        : template.description,
    variant: template.variant,
    items: ranked.map((item, i) => ({
      label: item.label,
      value: shares[i]!,
      display: `${shares[i]}%`,
    })),
  }
}

function toHeatmap(values: number[][]): Heatmap {
  const max = Math.max(...values.flat(), 0.0001)
  let best = { d: 0, s: 1, v: -1 }
  const normalised = values.map((row, d) =>
    row.map((v, s) => {
      const score = Math.round((v / max) * 100)
      if (score > best.v) best = { d, s, v: score }
      return score
    })
  )
  return { days: DAYS, slots: SLOTS, values: normalised, best: { day: DAYS[best.d]!, slot: SLOTS[best.s]! } }
}

function topPostsFor(ctx: Ctx, accounts: NetworkData[], limit = 8): TopPost[] {
  const { db, brandId, range, today } = ctx
  const byNetwork = new Map(accounts.map((a) => [a.account.network, a]))
  const { from, to } = windowIso(today, range)
  return db.posts
    .filter(
      (p) =>
        p.brandId === brandId &&
        p.status === "published" &&
        p.publishedAt &&
        p.publishedAt >= from &&
        p.publishedAt <= to
    )
    .flatMap((p) =>
      p.networks.flatMap((n) => {
        const data = byNetwork.get(n)
        if (!data) return []
        const r = random(`${p.id}:${n}`)
        const reach = Math.round(data.followers * (0.25 + r() * 1.4))
        return [
          {
            id: `${p.id}:${n}`,
            network: n,
            title: postTitle(p),
            publishedAt: p.publishedAt!,
            reach,
            engagementRate: round1(data.profile.engagementBase * (0.6 + r() * 1.2)),
            clicks: Math.round(reach * (0.01 + r() * 0.04)),
          },
        ]
      })
    )
    .sort((a, b) => b.reach - a.reach)
    .slice(0, limit)
}

/* Combined dashboard ------------------------------------------------------- */

const contentAffinity: Record<string, Partial<Record<NetworkId, number>>> = {
  Video: { tiktok: 1, youtube: 1, instagram: 0.5, facebook: 0.4, pinterest: 0.3, x: 0.15, threads: 0.15, linkedin: 0.1 },
  Carousel: { instagram: 0.2, linkedin: 0.3, pinterest: 0.2 },
  Photo: { instagram: 0.3, pinterest: 0.5, facebook: 0.3, google_business: 1, threads: 0.3, x: 0.3, linkedin: 0.2 },
  Text: { x: 0.5, threads: 0.55, linkedin: 0.35, facebook: 0.15 },
  Link: { x: 0.1, linkedin: 0.15, facebook: 0.15 },
}
const contentLift: Record<string, number> = { Video: 1.25, Carousel: 1.2, Photo: 0.95, Text: 0.8, Link: 0.6 }

function summarise(ctx: Ctx, accounts: NetworkData[]): AnalyticsSummary {
  const { buckets } = ctx
  const seed = `${ctx.key}:all`
  const next = random(seed)

  const sum = (pick: (m: Metrics) => number) => accounts.reduce((total, a) => total + pick(a.metrics), 0)
  const followers = sum((m) => m.followers)
  const reach = sum((m) => m.reach)
  const impressions = sum((m) => m.impressions)
  const engagements = sum((m) => m.engagements)
  const clicks = sum((m) => m.clicks)
  const growth = sum((m) => m.growth)
  const posts = accounts.reduce((total, a) => total + a.posts, 0)
  const engagementRate = impressions ? round1((engagements / impressions) * 100) : 0

  const stat = (id: string, label: string, value: number, fmt: Stat["format"] = "number"): Kpi =>
    makeKpi({ id, label, value, format: fmt, change: periodChange(next, id) }, seed)

  const rows: NetworkRow[] = accounts
    .map((a) => ({
      network: a.account.network,
      status: a.account.status,
      followers: a.followers,
      followerGrowth: a.metrics.growth,
      growthRate: round1((a.metrics.growth / Math.max(a.followers - a.metrics.growth, 1)) * 100),
      reach: a.metrics.reach,
      impressions: a.metrics.impressions,
      engagementRate: a.metrics.engagementRate,
      clicks: a.metrics.clicks,
      posts: a.posts,
      reachShare: reach ? Math.round((a.metrics.reach / reach) * 100) : 0,
    }))
    .sort((a, b) => b.reach - a.reach)

  const timeline = buckets.map((bucket, i) => ({
    ...bucket,
    values: Object.fromEntries(accounts.map((a) => [a.account.network, a.series[i]!])) as Partial<Record<NetworkId, number>>,
  }))
  const impressionSeries: TimelinePoint[] = buckets.map((bucket, i) => ({
    ...bucket,
    value: accounts.reduce((total, a) => total + a.series[i]!, 0),
  }))

  const audience = accounts
    .map((a) => ({ network: a.account.network, followers: a.followers, share: followers ? Math.round((a.followers / followers) * 100) : 0 }))
    .sort((a, b) => b.followers - a.followers)

  const typeRand = random(`${seed}:types`)
  const contentTypes: Breakdown = {
    id: "content",
    title: "Engagement rate by content type",
    description: "Averaged across the networks you've connected",
    variant: "bars",
    items: Object.keys(contentAffinity)
      .filter((type) => accounts.some((a) => (contentAffinity[type]![a.account.network] ?? 0) > 0))
      .map((type) => {
        const value = round1(engagementRate * contentLift[type]! * (0.92 + typeRand() * 0.16))
        return { label: type, value, display: `${value}%` }
      })
      .sort((a, b) => b.value - a.value),
  }

  const heat = toHeatmap(
    DAYS.map((_, d) =>
      SLOTS.map((_, s) => accounts.reduce((total, a) => total + a.heatmap[d]![s]! * (a.metrics.reach / (reach || 1)), 0))
    )
  )

  const demoSeed = `${seed}:demographics`
  const demographics = {
    age: aggregateDemographic(accounts, "age", demoSeed),
    gender: aggregateDemographic(accounts, "gender", demoSeed),
    countries: aggregateDemographic(accounts, "countries", demoSeed, 6),
    cities: aggregateDemographic(accounts, "cities", demoSeed, 6),
  }

  return {
    kpis: [
      stat("followers", "Total followers", followers),
      stat("reach", "Total reach", reach),
      stat("engagement", "Engagement rate", engagementRate, "percent"),
      stat("clicks", "Link clicks", clicks),
      stat("posts", "Posts published", posts),
      stat("growth", "New followers", growth),
    ],
    impressions: impressionSeries,
    timeline,
    audience,
    networks: rows,
    contentTypes,
    demographics,
    heatmap: heat,
    insights: combinedInsights(ctx, rows, heat),
    topPosts: topPostsFor(ctx, accounts),
  }
}

function combinedInsights(ctx: Ctx, rows: NetworkRow[], heat: Heatmap): Insight[] {
  const out: Insight[] = []
  if (rows.length === 0) return out

  const name = (n: NetworkId) => networks[n].name
  const avgEngagement = round1(rows.reduce((total, r) => total + r.engagementRate, 0) / rows.length)

  if (rows.length > 1) {
    const top = [...rows].sort((a, b) => b.engagementRate - a.engagementRate)[0]!
    out.push({
      id: "engagement",
      tone: "positive",
      network: top.network,
      title: `${name(top.network)} is your most engaging network`,
      body: `${top.engagementRate}% engagement, against an average of ${avgEngagement}% across your networks.`,
    })

    const totalFollowers = rows.reduce((total, r) => total + r.followers, 0)
    const overIndex = [...rows]
      .map((r) => ({ r, gap: r.reachShare - (r.followers / Math.max(totalFollowers, 1)) * 100 }))
      .sort((a, b) => b.gap - a.gap)[0]!
    if (overIndex.gap >= 5) {
      out.push({
        id: "over-index",
        tone: "positive",
        network: overIndex.r.network,
        title: `${name(overIndex.r.network)} punches above its audience`,
        body: `It brings ${overIndex.r.reachShare}% of your reach from ${Math.round(overIndex.r.followers / Math.max(totalFollowers, 1) * 100)}% of your followers. Worth posting there more often.`,
      })
    }

    const fastest = [...rows].sort((a, b) => b.growthRate - a.growthRate)[0]!
    out.push({
      id: "growth",
      tone: "neutral",
      network: fastest.network,
      title: `${name(fastest.network)} is growing fastest`,
      body: `+${formatCompact(fastest.followerGrowth)} followers (${fastest.growthRate}%) in the last ${ctx.range} days.`,
    })
  }

  out.push({
    id: "best-time",
    tone: "neutral",
    title: `Best window: ${heat.best.day} around ${heat.best.slot}`,
    body: "That slot gets the strongest engagement when every network is combined. Schedule your most important posts there.",
  })

  for (const row of rows.filter((r) => r.status === "expiring")) {
    out.push({
      id: `expiring-${row.network}`,
      tone: "attention",
      network: row.network,
      title: `Reconnect ${name(row.network)} soon`,
      body: "The connection is about to expire. Its numbers will stop updating and scheduled posts may fail.",
    })
  }

  const missing = Object.keys(networks).length - rows.length
  if (missing > 0) {
    out.push({
      id: "coverage",
      tone: "neutral",
      title: `You're tracking ${rows.length} of ${Object.keys(networks).length} networks`,
      body: "Connect the rest to see your full cross-network picture.",
    })
  }

  return out.slice(0, 4)
}

/* Single network ----------------------------------------------------------- */

function networkInsights(ctx: Ctx, data: NetworkData, breakdowns: Breakdown[], heat: Heatmap): Insight[] {
  const { network } = data.account
  const label = networks[network].name
  const out: Insight[] = []

  if (data.account.status === "expiring") {
    out.push({
      id: "expiring",
      tone: "attention",
      title: `Your ${label} connection expires soon`,
      body: "Reconnect to keep these numbers up to date and avoid failed posts.",
    })
  }

  const best = [...data.kpis].sort((a, b) => b.change - a.change)[0]!
  if (best.change > 0) {
    out.push({
      id: "momentum",
      tone: "positive",
      title: `${best.label} is up ${best.change}%`,
      body: `Your strongest move versus the previous ${ctx.range} days.`,
    })
  }
  const worst = [...data.kpis].sort((a, b) => a.change - b.change)[0]!
  if (worst.change < 0) {
    out.push({
      id: "slipping",
      tone: "attention",
      title: `${worst.label} slipped ${Math.abs(worst.change)}%`,
      body: `Compared with the previous ${ctx.range} days. Review what you posted in that stretch.`,
    })
  }

  const lead = breakdowns[0]?.items[0]
  if (lead && breakdowns[0]) {
    out.push({
      id: "leader",
      tone: "neutral",
      title: `${lead.label} leads at ${lead.display}`,
      body: `${breakdowns[0].title}: this is your biggest slice, so lean into it.`,
    })
  }

  out.push({
    id: "best-time",
    tone: "neutral",
    title: `Post on ${heat.best.day} around ${heat.best.slot}`,
    body: `Your ${label} audience is most active then.`,
  })

  return out.slice(0, 4)
}

const round2 = (n: number) => Math.round(n * 100) / 100

/** Share of ad revenue the creator keeps; used to estimate gross CPM from net revenue. */
const CREATOR_REVENUE_SHARE = 0.55

/**
 * Earnings for networks that report them. Mirrors what YouTube's Analytics API returns
 * (estimatedRevenue, RPM, playback-based CPM, monetizedPlaybacks): revenue exists only
 * for monetized channels, and every figure is an estimate.
 */
function buildMonetization(ctx: Ctx, data: NetworkData): Monetization | undefined {
  const spec = data.profile.monetization
  if (!spec) return undefined
  if (data.followers < spec.minFollowers) return { status: "not_monetized", reason: spec.ineligibleReason }

  const seed = `${ctx.key}:${data.account.network}:earnings`
  const r = random(seed)
  const rpm = spec.rpm[0] + r() * (spec.rpm[1] - spec.rpm[0])
  const monetizedRate = spec.monetizedRate[0] + r() * (spec.monetizedRate[1] - spec.monetizedRate[0])

  // Earnings follow views bucket by bucket, so the revenue chart always lines up with the views chart.
  const timeline = ctx.buckets.map((bucket, i) => ({
    ...bucket,
    value: round2((data.series[i]! / 1000) * rpm * (0.88 + r() * 0.24)),
  }))
  const revenue = round2(timeline.reduce((sum, p) => sum + p.value, 0))
  const views = data.metrics.impressions
  const monetizedPlaybacks = Math.round(views * monetizedRate)

  const stat = (id: string, label: string, value: number, format: Stat["format"]): Kpi =>
    makeKpi({ id, label, value, format, change: periodChange(random(`${seed}:${id}`), id) }, seed)

  const sources = buildBreakdown(spec.sources, seed)
  return {
    status: "monetized",
    kpis: [
      stat("revenue", "Estimated revenue", revenue, "currency"),
      stat("rpm", "RPM", views ? round2((revenue / views) * 1000) : 0, "currency"),
      stat("cpm", "Playback-based CPM", monetizedPlaybacks ? round2((revenue / CREATOR_REVENUE_SHARE / monetizedPlaybacks) * 1000) : 0, "currency"),
      stat("monetizedPlaybacks", "Monetized playbacks", monetizedPlaybacks, "number"),
    ],
    timelineTitle: "Estimated revenue",
    timeline,
    breakdowns: [
      {
        ...sources,
        items: sources.items.map((item) => {
          const amount = round2((revenue * item.value) / 100)
          return { label: item.label, value: amount, display: formatCurrency(amount) }
        }),
      },
    ],
  }
}

function buildNetworkAnalytics(ctx: Ctx, network: NetworkId, account: SocialAccount | undefined): NetworkAnalytics {
  const profile = profiles[network]
  const demographicLabels = profile.breakdowns.filter((b) => DEMOGRAPHIC_IDS.has(b.id)).map((b) => b.title)
  const base = {
    network,
    status: account?.status ?? ("disconnected" as const),
    handle: account?.handle ?? null,
    trackedMetrics: [
      ...profile.kpis.map((s) => s.label),
      ...(profile.monetization ? ["Estimated revenue", "RPM", "CPM"] : []),
      ...demographicLabels,
      ...profile.highlights.map((s) => s.label),
    ],
  }

  if (!account || account.status === "disconnected") {
    return {
      ...base,
      followers: 0,
      kpis: [],
      timelineTitle: profile.timelineTitle,
      timeline: [],
      highlights: [],
      breakdowns: [],
      heatmap: toHeatmap(DAYS.map(() => SLOTS.map(() => 0))),
      insights: [],
      topPosts: [],
    }
  }

  const data = buildNetwork(ctx, account)
  const seed = `${ctx.key}:${network}`
  const breakdowns = profile.breakdowns.map((spec) => buildBreakdown(spec, seed))
  const heatmap = toHeatmap(data.heatmap)

  return {
    ...base,
    followers: data.followers,
    kpis: data.kpis,
    timelineTitle: profile.timelineTitle,
    timeline: ctx.buckets.map((bucket, i) => ({ ...bucket, value: data.series[i]! })),
    highlights: data.highlights,
    breakdowns,
    monetization: buildMonetization(ctx, data),
    heatmap,
    insights: networkInsights(ctx, data, breakdowns, heatmap),
    topPosts: topPostsFor(ctx, [data], 6),
  }
}

/** Inclusive ISO bounds of the window ending on `today`. */
function windowIso(today: Date, range: AnalyticsRange) {
  return { from: addDays(today, -(range - 1)).toISOString(), to: endOfDay(today).toISOString() }
}

function context(db: MockDb, { range, end }: AnalyticsParams): Ctx {
  const days = Math.min(Math.max(Math.round(range), 1), 365)
  const today = end ? startOfDay(parseISO(end)) : startOfDay(new Date())
  const brandId = db.workspace.activeBrandId
  return { db, brandId, range: days, today, key: `${brandId}:${days}:${end ?? "now"}`, buckets: makeBuckets(days, today) }
}

export const analyticsApi = {
  /** Every connected network combined. */
  summary(params: AnalyticsParams) {
    return read((db): AnalyticsSummary => {
      const ctx = context(db, params)
      const accounts = db.accounts
        .filter((a) => a.brandId === ctx.brandId && a.status !== "disconnected")
        .map((a) => buildNetwork(ctx, a))
      return summarise(ctx, accounts)
    })
  },

  /** One network, with the metrics that network actually reports. */
  network({ network, ...params }: NetworkAnalyticsParams) {
    return read((db): NetworkAnalytics => {
      const ctx = context(db, params)
      const account = db.accounts.find((a) => a.brandId === ctx.brandId && a.network === network)
      return buildNetworkAnalytics(ctx, network, account)
    })
  },
}
