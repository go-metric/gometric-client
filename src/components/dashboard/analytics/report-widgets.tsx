"use client"

import { useMemo, useState } from "react"
import { format, parseISO } from "date-fns"
import { ArrowDown, ArrowUp, ExternalLink, Info } from "lucide-react"
import { BarChart, ChartLegend, Heatmap as HeatmapChart, ProgressBar } from "@/components/charts"
import { EmptyState, ListSkeleton, Panel, Segmented } from "@/components/dashboard/ui"
import { NetworkBadge } from "@/components/network"
import { TimeSeriesChart } from "@/components/time-series"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { networkThemes } from "@/config/network-themes"
import { networks, type NetworkId } from "@/config/networks"
import type {
  AccountReport,
  AnalyticsReport,
  DemographicDimension,
  MetricSeriesId,
  TopPost,
} from "@/lib/api/types"
import { formatCompact } from "@/lib/format"
import { cn } from "@/lib/utils"

const trendMetrics: { id: MetricSeriesId; label: string }[] = [
  { id: "followers", label: "Followers" },
  { id: "reach", label: "Reach" },
  { id: "views", label: "Views" },
  { id: "profile_views", label: "Profile visits" },
  { id: "clicks", label: "Clicks" },
]

/** Daily values per network for one metric. Days a network didn't report are left out, never zero-filled. */
export function buildTrend(accounts: AccountReport[], metric: MetricSeriesId) {
  const byNetwork = new Map<NetworkId, Map<string, number>>()
  for (const a of accounts) {
    const pts = a.series[metric]
    if (!pts?.length) continue
    const m = byNetwork.get(a.network) ?? new Map<string, number>()
    for (const p of pts) m.set(p.date, (m.get(p.date) ?? 0) + p.value)
    byNetwork.set(a.network, m)
  }
  const dates = [...new Set([...byNetwork.values()].flatMap((m) => [...m.keys()]))].sort()
  return {
    series: [...byNetwork.keys()].map((n) => ({ id: n, label: networks[n].name, color: networkThemes[n].accent })),
    points: dates.map((date) => ({
      label: format(parseISO(date), "MMM d"),
      detail: format(parseISO(date), "EEE, MMM d"),
      values: Object.fromEntries([...byNetwork].flatMap(([n, m]) => (m.has(date) ? [[n, m.get(date)!]] : []))) as Partial<Record<NetworkId, number>>,
    })),
  }
}

export function TrendPanel({ accounts, loading, title = "Trend" }: { accounts: AccountReport[] | undefined; loading: boolean; title?: string }) {
  const [metric, setMetric] = useState<MetricSeriesId>("followers")
  const trend = useMemo(() => (accounts ? buildTrend(accounts, metric) : null), [accounts, metric])
  const reasons = useMemo(
    () => [...new Set((accounts ?? []).map((a) => a.unavailable[metric] ?? (metric === "followers" ? a.followers.note : undefined)).filter(Boolean))] as string[],
    [accounts, metric],
  )
  const needsHistory = metric === "followers" && trend && trend.points.length === 1

  return (
    <Panel
      title={title}
      action={
        <Segmented label="Metric" value={metric} onChange={setMetric} options={trendMetrics.map((m) => ({ value: m.id, label: m.label }))} />
      }
    >
      {loading || !trend ? (
        <div className="h-60 animate-pulse rounded-2xl bg-muted sm:h-72" />
      ) : trend.points.length === 0 ? (
        <EmptyState
          icon={<Info />}
          title={`No ${trendMetrics.find((m) => m.id === metric)!.label.toLowerCase()} data for this period`}
          description={reasons[0] ?? "The connected networks haven't reported this metric. Data builds up as daily snapshots are collected."}
        />
      ) : (
        <>
          <TimeSeriesChart points={trend.points} series={trend.series} className="h-60 sm:h-72" />
          <ChartLegend items={trend.series} className="mt-4" />
          {needsHistory ? (
            <p className="mt-3 text-xs text-muted-foreground">Only one daily snapshot so far. The trend fills in as more days are collected.</p>
          ) : null}
        </>
      )}
    </Panel>
  )
}

export function ComparisonTable({ accounts }: { accounts: AccountReport[] }) {
  const cell = (v: number | null, suffix = "") => (v === null ? <span className="text-muted-foreground">n/a</span> : `${formatCompact(v)}${suffix}`)
  const metric = (a: AccountReport, id: string) => a.metrics.find((m) => m.id === id)?.value ?? null
  const bestRate = Math.max(...accounts.map((a) => a.engagement.rate ?? -1))
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[52rem] text-left text-sm">
        <thead className="text-xs text-muted-foreground">
          <tr className="border-b border-border">
            <th scope="col" className="px-5 py-3 font-medium sm:px-6">Network</th>
            {["Followers", "Growth", "Reach", "Views", "Engagement", "Clicks", "Posts"].map((h) => (
              <th key={h} scope="col" className="px-3 py-3 text-right font-medium">{h}</th>
            ))}
            <th scope="col" className="px-3 py-3 pr-5 text-right font-medium sm:pr-6">Last sync</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((a) => (
            <tr key={a.accountId} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
              <td className="px-5 py-3 sm:px-6">
                <span className="flex items-center gap-3 font-medium">
                  <NetworkBadge network={a.network} className="ring-0" />
                  <span className="min-w-0">
                    {networks[a.network].name}
                    <span className="block truncate text-xs font-normal text-muted-foreground">{a.handle}</span>
                  </span>
                  {a.status === "expired" ? (
                    <span className="rounded-full bg-red-500/12 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:text-red-300">Reconnect</span>
                  ) : null}
                </span>
              </td>
              <td className="px-3 py-3 text-right font-medium">{cell(a.followers.value)}</td>
              <td className="px-3 py-3 text-right font-medium" title={a.followers.note}>
                {a.followers.growth === null ? <span className="text-muted-foreground">n/a</span> : `${a.followers.growth > 0 ? "+" : ""}${formatCompact(a.followers.growth)}`}
              </td>
              <td className="px-3 py-3 text-right font-medium" title={a.unavailable.reach}>{cell(metric(a, "reach"))}</td>
              <td className="px-3 py-3 text-right font-medium" title={a.unavailable.views}>{cell(metric(a, "views"))}</td>
              <td
                className={cn("px-3 py-3 text-right", a.engagement.rate !== null && a.engagement.rate === bestRate ? "font-semibold text-emerald-700 dark:text-emerald-300" : "font-medium")}
                title={a.engagement.basis ? `Interactions ÷ ${a.engagement.basis}` : a.engagement.note}
              >
                {cell(a.engagement.rate, "%")}
              </td>
              <td className="px-3 py-3 text-right font-medium" title={a.unavailable.clicks}>{cell(metric(a, "clicks"))}</td>
              <td className="px-3 py-3 text-right font-medium">{cell(a.publishedPosts)}</td>
              <td className="px-3 py-3 pr-5 text-right text-xs text-muted-foreground sm:pr-6">
                {a.syncError ? <span className="text-amber-700 dark:text-amber-300" title={a.syncError}>Issue</span> : a.syncedAt ? format(new Date(a.syncedAt), "MMM d, HH:mm") : "Pending"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type SortKey = "interactions" | "engagementRate" | "views" | "reach"

const topColumns: { key: SortKey; label: string; value: (p: TopPost) => number | null; suffix?: string }[] = [
  { key: "interactions", label: "Interactions", value: (p) => p.interactions },
  { key: "engagementRate", label: "Engagement", value: (p) => p.engagementRate, suffix: "%" },
  { key: "views", label: "Views", value: (p) => p.metrics.views ?? null },
  { key: "reach", label: "Reach", value: (p) => p.metrics.reach ?? null },
]

export function TopPostsPanel({ posts, title = "Best-performing posts" }: { posts: TopPost[] | undefined; title?: string }) {
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "interactions", desc: true })
  const [open, setOpen] = useState<TopPost | null>(null)
  const col = topColumns.find((c) => c.key === sort.key)!
  const sorted = [...(posts ?? [])].sort((a, b) => {
    const av = col.value(a)
    const bv = col.value(b)
    if (av === null && bv === null) return 0
    if (av === null) return 1 // posts without the metric always sort last
    if (bv === null) return -1
    return sort.desc ? bv - av : av - bv
  })

  return (
    <Panel title={title} bodyClassName="px-0 pb-2 sm:px-0">
      {!posts ? (
        <ListSkeleton rows={4} className="px-5 sm:px-6" />
      ) : sorted.length === 0 ? (
        <EmptyState title="No posts with engagement data" description="Posts published in this period appear once the platform reports their metrics." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th scope="col" className="px-5 py-3 font-medium sm:px-6">Post</th>
                <th scope="col" className="px-3 py-3 font-medium">Published</th>
                {topColumns.map((c) => (
                  <th key={c.key} scope="col" aria-sort={sort.key === c.key ? (sort.desc ? "descending" : "ascending") : "none"} className="px-3 py-3 text-right font-medium last:pr-5 sm:last:pr-6">
                    <button type="button" onClick={() => setSort((s) => ({ key: c.key, desc: s.key === c.key ? !s.desc : true }))} className="inline-flex cursor-pointer items-center gap-1 hover:text-foreground">
                      {c.label}
                      {sort.key === c.key ? sort.desc ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" /> : null}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((post) => (
                <tr key={post.id} className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-muted/40" onClick={() => setOpen(post)}>
                  <td className="px-5 py-3 sm:px-6">
                    <button type="button" className="flex items-center gap-3 text-left" onClick={() => setOpen(post)}>
                      <NetworkBadge network={post.network} className="ring-0" />
                      <span className="line-clamp-1 font-medium">{post.title}</span>
                    </button>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">{format(new Date(post.publishedAt), "MMM d")}</td>
                  {topColumns.map((c) => {
                    const v = c.value(post)
                    return (
                      <td key={c.key} className="px-3 py-3 text-right font-medium last:pr-5 sm:last:pr-6">
                        {v === null ? <span className="text-muted-foreground">n/a</span> : `${formatCompact(v)}${c.suffix ?? ""}`}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <PostDetail post={open} onClose={() => setOpen(null)} />
    </Panel>
  )
}

const metricLabels: Record<string, string> = {
  reach: "Reach",
  views: "Views / impressions",
  likes: "Likes",
  comments: "Comments",
  shares: "Shares",
  saves: "Saves",
  replies: "Replies",
  reposts: "Reposts",
  quotes: "Quotes",
  clicks: "Clicks",
}

/** Drill-down: every metric the platform reported for this post. */
function PostDetail({ post, onClose }: { post: TopPost | null; onClose: () => void }) {
  return (
    <Dialog open={!!post} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        {post ? (
          <>
            <DialogHeader>
              <DialogTitle className="line-clamp-2 text-base">{post.title}</DialogTitle>
              <DialogDescription>
                {networks[post.network].name} {post.handle} · {format(new Date(post.publishedAt), "MMM d, yyyy HH:mm")}
              </DialogDescription>
            </DialogHeader>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {Object.entries(metricLabels).map(([id, label]) => (
                <div key={id} className="rounded-xl bg-muted/50 px-3 py-2">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="font-semibold">{post.metrics[id] === undefined ? <span className="font-normal text-muted-foreground">Not reported</span> : formatCompact(post.metrics[id]!)}</dd>
                </div>
              ))}
              <div className="col-span-2 rounded-xl bg-muted/50 px-3 py-2">
                <dt className="text-xs text-muted-foreground">Engagement rate</dt>
                <dd className="font-semibold">
                  {post.engagementRate === null ? <span className="font-normal text-muted-foreground">Not available</span> : `${post.engagementRate}%`}
                  {post.engagementBasis ? <span className="ml-2 text-xs font-normal text-muted-foreground">interactions ÷ {post.engagementBasis}</span> : null}
                </dd>
              </div>
            </dl>
            {post.permalink ? (
              <a href={post.permalink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-2">
                View on {networks[post.network].name}
                <ExternalLink className="size-3.5" />
              </a>
            ) : null}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

const demographicTitles: Record<DemographicDimension, string> = {
  age: "Audience age",
  gender: "Audience gender",
  country: "Top countries",
  city: "Top cities",
}

export function DemographicsPanels({ report }: { report: AnalyticsReport | undefined }) {
  if (!report) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Object.values(demographicTitles).map((t) => (
          <Panel key={t} title={t}><ListSkeleton rows={4} /></Panel>
        ))}
      </div>
    )
  }
  const dims = (Object.keys(demographicTitles) as DemographicDimension[]).filter((d) => report.demographics[d]?.length)
  if (dims.length === 0) {
    const reason = report.accounts.map((a) => a.unavailable.demographics).find(Boolean)
    return (
      <Panel title="Audience demographics">
        <EmptyState
          icon={<Info />}
          title="Demographics aren't available"
          description={reason ?? "Platforms only share audience demographics once an account has enough followers, and not every network offers them."}
        />
      </Panel>
    )
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {dims.map((d) => (
        <Panel key={d} title={demographicTitles[d]}>
          <ul className="space-y-3.5">
            {report.demographics[d]!.map((item) => (
              <li key={item.label}>
                <div className="mb-1.5 flex justify-between gap-3 text-sm">
                  <span className="truncate text-muted-foreground">{item.label}</span>
                  <span className="font-semibold">{item.share}%</span>
                </div>
                <ProgressBar value={item.share} />
              </li>
            ))}
          </ul>
        </Panel>
      ))}
    </div>
  )
}

export function BestTimePanel({ report }: { report: AnalyticsReport | undefined }) {
  return (
    <Panel title="Best time to post">
      {!report ? (
        <div className="h-52 animate-pulse rounded-2xl bg-muted" />
      ) : report.bestTimes ? (
        <>
          <p className="-mt-2 mb-4 text-xs text-muted-foreground">
            From {report.bestTimes.basedOnPosts} posts, in your brand&apos;s timezone. Darker means more interactions per post. Top slot:{" "}
            <span className="font-semibold text-foreground">{report.bestTimes.best.day}, {report.bestTimes.best.slot}</span>
          </p>
          <HeatmapChart {...report.bestTimes} />
        </>
      ) : (
        <EmptyState icon={<Info />} title="Not enough posts yet" description="Best-time guidance needs at least 8 posts with engagement data in the period." />
      )}
    </Panel>
  )
}

export function PublishingPanel({ report }: { report: AnalyticsReport | undefined }) {
  const days = useMemo(() => {
    if (!report?.publishing) return null
    const counts = new Map(report.publishing.map((p) => [p.date, p.count]))
    const out: { date: string; count: number }[] = []
    for (let d = parseISO(report.range.start); d <= parseISO(report.range.end); d = new Date(d.getTime() + 86_400_000)) {
      const key = d.toISOString().slice(0, 10)
      out.push({ date: key, count: counts.get(key) ?? 0 })
    }
    return out
  }, [report])
  return (
    <Panel title="Publishing activity">
      {!report ? (
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      ) : !days ? (
        <EmptyState icon={<Info />} title="No post data yet" description="Published posts appear here after the first sync." />
      ) : (
        <BarChart
          className="h-40"
          values={days.map((d) => d.count)}
          titles={days.map((d) => `${format(parseISO(d.date), "MMM d")}: ${d.count} post${d.count === 1 ? "" : "s"}`)}
          labels={days.length <= 14 ? days.map((d) => format(parseISO(d.date), "d")) : undefined}
          highlight={-1}
        />
      )}
    </Panel>
  )
}

/** Source and freshness: which accounts the numbers come from, and anything that couldn't be collected. */
export function SourceNotes({ report }: { report: AnalyticsReport | undefined }) {
  if (!report) return null
  const lines: { key: string; text: string; warn?: boolean }[] = []
  for (const a of report.accounts) {
    const name = `${networks[a.network].name} ${a.handle ?? ""}`.trim()
    if (a.status === "expired") lines.push({ key: `${a.accountId}-x`, warn: true, text: `${name}: connection expired. Reconnect to resume collecting.` })
    if (a.syncError) lines.push({ key: `${a.accountId}-e`, warn: true, text: `${name}: ${a.syncError}` })
    for (const [metric, why] of Object.entries(a.unavailable)) lines.push({ key: `${a.accountId}-${metric}`, text: `${name} · ${metric.replace("_", " ")}: ${why}` })
    if (a.trackingSince && !a.syncError) lines.push({ key: `${a.accountId}-t`, text: `${name}: tracking since ${format(parseISO(a.trackingSince), "MMM d, yyyy")}${a.syncedAt ? `, last collected ${format(new Date(a.syncedAt), "MMM d, HH:mm")}` : ""}.` })
  }
  for (const u of report.unsupported) lines.push({ key: u.accountId, text: `${networks[u.network].name} ${u.handle ?? ""}: ${u.reason}` })
  if (lines.length === 0) return null
  return (
    <details className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
      <summary className="cursor-pointer font-medium">Data sources and limits ({lines.length})</summary>
      <ul className="mt-2 space-y-1.5">
        {lines.map((l) => (
          <li key={l.key} className={cn(l.warn && "text-amber-700 dark:text-amber-300")}>
            {l.text}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs">
        Metrics come straight from each platform&apos;s API. Daily dates use UTC. A dash or &ldquo;not available&rdquo; means the platform didn&apos;t report it, not zero.
      </p>
    </details>
  )
}
