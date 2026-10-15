"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Download } from "lucide-react"
import { DateRangePicker, fitsHistory, initialRange, rangeLabel, rangeParams, type RangeState } from "@/components/dashboard/analytics/date-range-picker"
import { NetworkDashboard } from "@/components/dashboard/analytics/network-dashboard"
import { NetworkTabs, type AnalyticsTab } from "@/components/dashboard/analytics/network-tabs"
import { OverviewDashboard } from "@/components/dashboard/analytics/overview-dashboard"
import { formatKpi } from "@/components/dashboard/kpi-cards"
import { ErrorState, PageHeader, Panel } from "@/components/dashboard/ui"
import { Button } from "@/components/ui/button"
import { networks } from "@/config/networks"
import { analyticsHistoryDays } from "@/config/pricing"
import type { AnalyticsRange, AnalyticsSummary, NetworkAnalytics } from "@/lib/api/types"
import { useAccounts } from "@/lib/queries/accounts"
import { useAnalytics, useNetworkAnalytics } from "@/lib/queries/analytics"
import { useBilling } from "@/lib/queries/billing"
import { cn } from "@/lib/utils"

type Cell = string | number
type Rows = Cell[][]

function download(rows: Rows, filename: string) {
  const escape = (v: Cell) => `"${String(v).replaceAll('"', '""')}"`
  const csv = rows.map((r) => r.map(escape).join(",")).join("\n")
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const topPostRows = (posts: AnalyticsSummary["topPosts"]): Rows => [
  [],
  ["Post", "Network", "Published", "Reach", "Engagement %", "Clicks"],
  ...posts.map((p) => [
    p.title,
    networks[p.network].name,
    format(new Date(p.publishedAt), "yyyy-MM-dd"),
    p.reach,
    p.engagementRate,
    p.clicks,
  ]),
]

function exportOverview(data: AnalyticsSummary, range: AnalyticsRange) {
  download(
    [
      ["Metric", "Value", "Change %"],
      ...data.kpis.map((k) => [k.label, formatKpi(k), k.change]),
      [],
      ["Network", "Followers", "Follower growth", "Reach", "Impressions", "Engagement %", "Clicks", "Posts", "Share of reach %"],
      ...data.networks.map((n) => [
        networks[n.network].name,
        n.followers,
        n.followerGrowth,
        n.reach,
        n.impressions,
        n.engagementRate,
        n.clicks,
        n.posts,
        n.reachShare,
      ]),
      ...topPostRows(data.topPosts),
    ],
    `gometric-analytics-all-${range}d.csv`
  )
}

function exportNetwork(data: NetworkAnalytics, range: AnalyticsRange) {
  download(
    [
      ["Metric", "Value", "Change %"],
      ...[...data.kpis, ...data.highlights].map((s) => [s.label, formatKpi(s), s.change]),
      ...data.breakdowns.flatMap((b) => [[], [b.title, "Share"], ...b.items.map((i) => [i.label, i.display])]),
      ...topPostRows(data.topPosts),
    ],
    `gometric-analytics-${data.network}-${range}d.csv`
  )
}

export function AnalyticsView() {
  const [pickedRange, setRangeState] = useState<RangeState>(initialRange)
  const { data: billing } = useBilling()
  // Until billing loads, don't restrict; a downgrade falls back to the default period.
  const historyDays = billing ? analyticsHistoryDays(billing.subscription.planId) : 365
  const rangeState = fitsHistory(pickedRange, historyDays) ? pickedRange : initialRange
  const params = rangeParams(rangeState)
  const range = params.range
  const [tab, setTab] = useState<AnalyticsTab>("all")

  const { data: accounts } = useAccounts()
  const overview = useAnalytics(params)
  const isNetwork = tab !== "all"
  const detail = useNetworkAnalytics({ ...params, network: isNetwork ? tab : "instagram" }, isNetwork)

  const active = isNetwork ? detail : overview
  const canExport = isNetwork ? !!detail.data && detail.data.status !== "disconnected" : !!overview.data && overview.data.networks.length > 0

  function exportCsv() {
    if (isNetwork) {
      if (detail.data) exportNetwork(detail.data, range)
    } else if (overview.data) {
      exportOverview(overview.data, range)
    }
  }

  return (
    <>
      <PageHeader
        title="Analytics"
        description={
          isNetwork
            ? `${networks[tab].name} performance, with the metrics that matter on that network.`
            : "Every connected network combined, so you can see what's working across channels."
        }
        actions={
          <>
            <DateRangePicker value={rangeState} onChange={setRangeState} historyDays={historyDays} />
            <Button variant="outline" disabled={!canExport} onClick={exportCsv}>
              <Download data-icon="inline-start" />
              Export CSV
            </Button>
          </>
        }
      />

      <NetworkTabs value={tab} onChange={setTab} accounts={accounts} />

      {active.error ? (
        <Panel>
          <ErrorState error={active.error} onRetry={() => active.refetch()} />
        </Panel>
      ) : (
        <div className={cn("transition-opacity", active.isPlaceholderData && "opacity-60")}>
          {isNetwork ? (
            <NetworkDashboard key={tab} network={tab} data={detail.data} range={range} rangeLabel={rangeLabel(rangeState)} />
          ) : (
            <OverviewDashboard
              data={overview.data}
              range={range}
              onSelectNetwork={(n) => {
                setTab(n)
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
            />
          )}
        </div>
      )}
    </>
  )
}
