import { format } from "date-fns"
import { formatKpi } from "@/components/dashboard/kpi-cards"
import { networks } from "@/config/networks"
import type { AnalyticsRange, AnalyticsSummary, NetworkAnalytics } from "@/lib/api/types"

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

export function exportOverview(data: AnalyticsSummary, range: AnalyticsRange) {
  const demographics = Object.values(data.demographics).flatMap((b) =>
    b ? [[], [b.title, "Share"], ...b.items.map((i) => [i.label, i.display])] : []
  )
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
      ...demographics,
      ...topPostRows(data.topPosts),
    ],
    `gometric-analytics-all-${range}d.csv`
  )
}

export function exportNetwork(data: NetworkAnalytics, range: AnalyticsRange) {
  const earnings =
    data.monetization?.status === "monetized"
      ? [
          [],
          ["Earnings (estimated, USD)", "Value", "Change %"],
          ...data.monetization.kpis.map((k) => [k.label, formatKpi(k), k.change]),
          ...data.monetization.breakdowns.flatMap((b) => [[], [b.title, "Estimated revenue"], ...b.items.map((i) => [i.label, i.display])]),
        ]
      : []
  download(
    [
      ["Metric", "Value", "Change %"],
      ...[...data.kpis, ...data.highlights].map((s) => [s.label, formatKpi(s), s.change]),
      ...earnings,
      ...data.breakdowns.flatMap((b) => [[], [b.title, "Share"], ...b.items.map((i) => [i.label, i.display])]),
      ...topPostRows(data.topPosts),
    ],
    `gometric-analytics-${data.network}-${range}d.csv`
  )
}
