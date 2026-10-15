"use client"

import { BarChart3 } from "lucide-react"
import { ChartLegend, DonutChart, ProgressBar } from "@/components/charts"
import { InsightsPanel, BreakdownPanel, HeatmapPanel, TopPostsPanel } from "@/components/dashboard/analytics/widgets"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { ButtonLink } from "@/components/ui/button"
import { EmptyState, ListSkeleton, Panel } from "@/components/dashboard/ui"
import { NetworkTile } from "@/components/network"
import { TimeSeriesChart } from "@/components/time-series"
import { networkThemes } from "@/config/network-themes"
import { networks, type NetworkId } from "@/config/networks"
import { routes } from "@/config/site"
import type { AnalyticsRange, AnalyticsSummary, NetworkRow } from "@/lib/api/types"
import { formatCompact, formatChange } from "@/lib/format"
import { cn } from "@/lib/utils"

function ChartSkeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-muted", className)} />
}

export function OverviewDashboard({
  data,
  range,
  onSelectNetwork,
}: {
  data: AnalyticsSummary | undefined
  range: AnalyticsRange
  onSelectNetwork: (network: NetworkId) => void
}) {
  if (data && data.networks.length === 0) {
    return (
      <Panel>
        <EmptyState
          icon={<BarChart3 />}
          title="No linked accounts"
          description="Connect a network to see how your channels perform together."
          action={<ButtonLink href={routes.dashboard.accounts}>Connect a network</ButtonLink>}
        />
      </Panel>
    )
  }

  const series = data?.networks.map((n) => ({ id: n.network, label: networks[n.network].name, color: networkThemes[n.network].accent })) ?? []
  const totalReach = data?.networks.reduce((sum, n) => sum + n.reach, 0) ?? 0
  const perDay = range <= 31

  return (
    <div className="space-y-4">
      <KpiCards kpis={data?.kpis} skeletons={6} compact className="sm:grid-cols-3 2xl:grid-cols-6 xl:grid-cols-3" />

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title={perDay ? "Impressions per day, by network" : "Impressions per week, by network"} className="xl:col-span-2">
          {data ? (
            <>
              <TimeSeriesChart points={data.timeline} series={series} className="h-60 sm:h-72" />
              <ChartLegend items={series} className="mt-4" />
            </>
          ) : (
            <ChartSkeleton className="h-60 sm:h-72" />
          )}
        </Panel>

        <Panel title="Where your reach comes from">
          {data ? (
            <div className="flex flex-col items-center gap-5 sm:flex-row xl:flex-col 2xl:flex-row">
              <DonutChart
                className="w-40 shrink-0"
                items={data.networks.map((n) => ({ label: networks[n.network].name, value: n.reach, color: networkThemes[n.network].accent }))}
                centerValue={formatCompact(totalReach)}
                centerLabel="Total reach"
              />
              <ul className="w-full min-w-0 flex-1 space-y-2.5">
                {data.networks.map((n) => (
                  <li key={n.network} className="flex items-center gap-2.5 text-sm">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: networkThemes[n.network].accent }} />
                    <span className="min-w-0 flex-1 truncate">{networks[n.network].name}</span>
                    <span className="text-muted-foreground">{formatCompact(n.reach)}</span>
                    <span className="w-9 text-right font-semibold">{n.reachShare}%</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ListSkeleton rows={4} />
          )}
        </Panel>
      </div>

      <Panel
        title="Network comparison"
        action={<span className="hidden text-xs text-muted-foreground sm:block">Select a network for its full dashboard</span>}
        bodyClassName="px-0 pb-2 sm:px-0"
      >
        {data ? <NetworkTable rows={data.networks} onSelect={onSelectNetwork} /> : <ListSkeleton rows={4} className="px-5 sm:px-6" />}
      </Panel>

      <div className="grid gap-4 xl:grid-cols-3">
        <InsightsPanel insights={data?.insights} title="What stands out" />
        <HeatmapPanel heatmap={data?.heatmap} />
        {data ? (
          <BreakdownPanel breakdown={data.contentTypes} />
        ) : (
          <Panel title="Engagement rate by content type"><ListSkeleton rows={4} /></Panel>
        )}
      </div>

      <TopPostsPanel posts={data?.topPosts} title="Top posts across networks" />
    </div>
  )
}

const tableColumns = [
  { key: "followers", label: "Followers" },
  { key: "growth", label: "Growth" },
  { key: "reach", label: "Reach" },
  { key: "engagement", label: "Engagement" },
  { key: "clicks", label: "Clicks" },
  { key: "posts", label: "Posts" },
] as const

function NetworkTable({ rows, onSelect }: { rows: NetworkRow[]; onSelect: (network: NetworkId) => void }) {
  const bestEngagement = Math.max(...rows.map((r) => r.engagementRate))
  const bestGrowth = Math.max(...rows.map((r) => r.growthRate))

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[48rem] text-left text-sm">
        <thead className="text-xs text-muted-foreground">
          <tr className="border-b border-border">
            <th scope="col" className="px-5 py-3 font-medium sm:px-6">Network</th>
            {tableColumns.map((c) => (
              <th key={c.key} scope="col" className="px-3 py-3 text-right font-medium">{c.label}</th>
            ))}
            <th scope="col" className="w-40 px-3 py-3 pr-5 font-medium sm:pr-6">Share of reach</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.network} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
              <td className="px-5 py-3 sm:px-6">
                <button
                  type="button"
                  onClick={() => onSelect(row.network)}
                  className="flex cursor-pointer items-center gap-3 text-left font-medium"
                >
                  <NetworkTile network={row.network} size="sm" />
                  <span>
                    {networks[row.network].name}
                    {row.status === "expiring" ? (
                      <span className="ml-2 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                        Reconnect
                      </span>
                    ) : null}
                  </span>
                </button>
              </td>
              <td className="px-3 py-3 text-right font-medium">{formatCompact(row.followers)}</td>
              <td className={cn("px-3 py-3 text-right", row.growthRate === bestGrowth ? "font-semibold text-emerald-700 dark:text-emerald-300" : "font-medium")}>
                {formatChange(row.growthRate)}
              </td>
              <td className="px-3 py-3 text-right font-medium">{formatCompact(row.reach)}</td>
              <td className={cn("px-3 py-3 text-right", row.engagementRate === bestEngagement ? "font-semibold text-emerald-700 dark:text-emerald-300" : "font-medium")}>
                {row.engagementRate}%
              </td>
              <td className="px-3 py-3 text-right font-medium">{formatCompact(row.clicks)}</td>
              <td className="px-3 py-3 text-right font-medium">{row.posts}</td>
              <td className="px-3 py-3 pr-5 sm:pr-6">
                <div className="flex items-center gap-2">
                  <ProgressBar className="flex-1" value={row.reachShare} color={networkThemes[row.network].accent} />
                  <span className="w-8 text-right text-xs font-semibold">{row.reachShare}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
