"use client"

import { useState } from "react"
import { format } from "date-fns"
import { AlertTriangle, ArrowDown, ArrowUp, Lightbulb, TrendingUp } from "lucide-react"
import { DonutChart, Heatmap as HeatmapChart, ProgressBar } from "@/components/charts"
import { formatKpi } from "@/components/dashboard/kpi-cards"
import { DeltaBadge, EmptyState, ListSkeleton, Panel } from "@/components/dashboard/ui"
import { NetworkBadge } from "@/components/network"
import { networkThemes } from "@/config/network-themes"
import type { Breakdown, Heatmap, Insight, Stat, TopPost } from "@/lib/api/types"
import { formatCompact } from "@/lib/format"
import { palette } from "@/lib/color"
import { cn } from "@/lib/utils"

const neutralPalette = ["#ff4d00", "#6366f1", "#14b8a6", "#f59e0b", "#ec4899", "#3b82f6"]

export function BreakdownPanel({
  breakdown,
  accent,
  className,
  cardClassName,
}: {
  breakdown: Breakdown
  accent?: string
  className?: string
  cardClassName?: string
}) {
  const { items } = breakdown
  const max = Math.max(...items.map((i) => i.value), 1)
  const colors = accent ? palette(accent, items.length) : neutralPalette

  return (
    <Panel
      title={breakdown.title}
      className={cn(cardClassName, className)}
    >
      {breakdown.description ? (
        <p className="-mt-2 mb-4 text-xs text-muted-foreground">{breakdown.description}</p>
      ) : null}
      {breakdown.variant === "donut" ? (
        // Wraps (donut above legend) in narrow cards instead of squeezing the legend labels to nothing.
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-4">
          <DonutChart
            className="w-32 shrink-0 sm:w-36"
            items={items.map((item, i) => ({ label: item.label, value: item.value, color: colors[i % colors.length]! }))}
            centerValue={items[0]?.display}
            centerLabel={items[0]?.label}
          />
          <ul className="min-w-36 flex-1 space-y-2 text-sm">
            {items.map((item, i) => (
              <li key={item.label} className="flex items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: colors[i % colors.length] }} />
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{item.label}</span>
                <span className="font-semibold">{item.display}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="space-y-3.5">
          {items.map((item) => (
            <li key={item.label}>
              <div className="mb-1.5 flex justify-between gap-3 text-sm">
                <span className="truncate text-muted-foreground">{item.label}</span>
                <span className="font-semibold">{item.display}</span>
              </div>
              <ProgressBar value={(item.value / max) * 100} color={accent} />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

const insightStyles: Record<Insight["tone"], { icon: typeof Lightbulb; className: string }> = {
  positive: { icon: TrendingUp, className: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" },
  neutral: { icon: Lightbulb, className: "bg-sky-500/12 text-sky-700 dark:text-sky-300" },
  attention: { icon: AlertTriangle, className: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
}

export function InsightsPanel({
  insights,
  title = "Insights",
  accent,
  className,
  cardClassName,
}: {
  insights: Insight[] | undefined
  title?: string
  /** Tints non-warning insights with the network colour. */
  accent?: string
  className?: string
  cardClassName?: string
}) {
  return (
    <Panel title={title} className={cn(cardClassName, className)}>
      {!insights ? (
        <ListSkeleton rows={3} />
      ) : insights.length === 0 ? (
        <EmptyState title="Nothing to report yet" description="Insights appear once there's activity to compare." />
      ) : (
        <ul className="space-y-4">
          {insights.map((insight) => {
            const { icon: Icon, className: tone } = insightStyles[insight.tone]
            const themed = accent && insight.tone !== "attention"
            return (
              <li key={insight.id} className="flex gap-3">
                <span
                  className={cn("mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-xl", !themed && tone)}
                  style={
                    themed
                      ? { background: `color-mix(in srgb, ${accent} 14%, transparent)`, color: `color-mix(in srgb, ${accent} 78%, var(--foreground))` }
                      : undefined
                  }
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <span className="min-w-0">{insight.title}</span>
                    {insight.network ? <NetworkBadge network={insight.network} className="ring-0" /> : null}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{insight.body}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}

export function HeatmapPanel({
  heatmap,
  accent,
  className,
  cardClassName,
}: {
  heatmap: Heatmap | undefined
  accent?: string
  className?: string
  cardClassName?: string
}) {
  return (
    <Panel title="Best time to post" className={cn(cardClassName, className)}>
      {heatmap ? (
        <>
          <p className="-mt-2 mb-4 text-xs text-muted-foreground">
            Darker means more engagement. Top slot:{" "}
            <span className="font-semibold text-foreground">
              {heatmap.best.day}, {heatmap.best.slot}
            </span>
          </p>
          <HeatmapChart {...heatmap} color={accent} />
        </>
      ) : (
        <div className="h-52 animate-pulse rounded-2xl bg-muted" />
      )}
    </Panel>
  )
}

/** Secondary metrics shown as compact tiles. */
export function StatTiles({
  stats,
  accent,
  cardClassName,
  className,
}: {
  stats: Stat[]
  accent?: string
  cardClassName?: string
  className?: string
}) {
  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4", className)}>
      {stats.map((stat) => (
        <li
          key={stat.id}
          className={cn("relative min-w-0 rounded-2xl border border-border bg-card px-4 py-3.5", cardClassName)}
        >
          {/* An inset bar, not a thicker top border, which warps on rounded corners. */}
          {accent ? <span aria-hidden className="absolute inset-x-5 top-0 h-0.5 rounded-b-full" style={{ background: accent }} /> : null}
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs text-muted-foreground">{stat.label}</p>
            <DeltaBadge value={stat.change} />
          </div>
          <p className="mt-1 text-xl font-semibold tracking-tight">{formatKpi(stat)}</p>
        </li>
      ))}
    </ul>
  )
}

type SortKey = "reach" | "engagementRate" | "clicks"

const columns: { key: SortKey; label: string; render: (p: TopPost) => string }[] = [
  { key: "reach", label: "Reach", render: (p) => formatCompact(p.reach) },
  { key: "engagementRate", label: "Engagement", render: (p) => `${p.engagementRate}%` },
  { key: "clicks", label: "Clicks", render: (p) => formatCompact(p.clicks) },
]

export function TopPostsPanel({
  posts,
  title = "Top posts",
  className,
  cardClassName,
}: {
  posts: TopPost[] | undefined
  title?: string
  className?: string
  cardClassName?: string
}) {
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "reach", desc: true })
  const sorted = [...(posts ?? [])].sort((a, b) => (sort.desc ? b[sort.key] - a[sort.key] : a[sort.key] - b[sort.key]))

  return (
    <Panel title={title} className={cn(cardClassName, className)} bodyClassName="px-0 pb-2 sm:px-0">
      {!posts ? (
        <ListSkeleton rows={4} className="px-5 sm:px-6" />
      ) : sorted.length === 0 ? (
        <EmptyState title="No published posts in this period" description="Try a longer date range." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th scope="col" className="px-5 py-3 font-medium sm:px-6">Post</th>
                <th scope="col" className="px-3 py-3 font-medium">Published</th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={sort.key === col.key ? (sort.desc ? "descending" : "ascending") : "none"}
                    className="px-3 py-3 text-right font-medium last:pr-5 sm:last:pr-6"
                  >
                    <button
                      type="button"
                      onClick={() => setSort((s) => ({ key: col.key, desc: s.key === col.key ? !s.desc : true }))}
                      className="inline-flex cursor-pointer items-center gap-1 hover:text-foreground"
                    >
                      {col.label}
                      {sort.key === col.key ? sort.desc ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" /> : null}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((post) => (
                <tr key={post.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3 sm:px-6">
                    <div className="flex items-center gap-3">
                      <span
                        className="relative size-10 shrink-0 rounded-xl"
                        style={{ background: networkThemes[post.network].gradient }}
                      >
                        <NetworkBadge network={post.network} className="absolute -right-1 -bottom-1" />
                      </span>
                      <span className="line-clamp-1 font-medium">{post.title}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">
                    {format(new Date(post.publishedAt), "MMM d")}
                  </td>
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-3 text-right font-medium last:pr-5 sm:last:pr-6">
                      {col.render(post)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}
