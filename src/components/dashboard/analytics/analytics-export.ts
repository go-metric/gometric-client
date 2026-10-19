import { networks } from "@/config/networks"
import type { AnalyticsReport, Metric } from "@/lib/api/types"

type Cell = string | number | null
type Rows = Cell[][]

function download(rows: Rows, filename: string) {
  // Blank cell = not reported by the platform. Zero is only written when the platform reported zero.
  const escape = (v: Cell) => (v === null ? "" : `"${String(v).replaceAll('"', '""')}"`)
  const csv = rows.map((r) => r.map(escape).join(",")).join("\n")
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const metricRows = (metrics: Metric[]): Rows => [
  ["Metric", "Value", "Previous period", "Change %", "Note"],
  ...metrics.map((m) => [m.label, m.value, m.previous, m.change, m.note ?? ""]),
]

export function exportReport(data: AnalyticsReport, scope: string) {
  const { range } = data
  const rows: Rows = [
    ["Report", scope],
    ["Period (UTC)", `${range.start} to ${range.end}`],
    ["Generated", data.generatedAt],
    [],
    ...metricRows(data.kpis),
    [],
    ["Network", "Account", "Followers", "Follower growth", "Reach", "Views", "Engagement %", "Engagement basis", "Clicks", "Posts", "Last collected"],
    ...data.accounts.map((a) => {
      const m = (id: string) => a.metrics.find((x) => x.id === id)?.value ?? null
      return [
        networks[a.network].name,
        a.handle ?? "",
        a.followers.value,
        a.followers.growth,
        m("reach"),
        m("views"),
        a.engagement.rate,
        a.engagement.basis ?? "",
        m("clicks"),
        a.publishedPosts,
        a.syncedAt ?? "",
      ]
    }),
    [],
    ["Daily values (only days the platform reported)"],
    ["Date", "Network", "Account", "Metric", "Value"],
    ...data.accounts.flatMap((a) =>
      Object.entries(a.series).flatMap(([metric, pts]) => (pts ?? []).map((p) => [p.date, networks[a.network].name, a.handle ?? "", metric, p.value])),
    ),
    [],
    ["Top posts"],
    ["Post", "Network", "Published", "Interactions", "Engagement %", "Views", "Reach", "Link"],
    ...data.topPosts.map((p) => [p.title, networks[p.network].name, p.publishedAt, p.interactions, p.engagementRate, p.metrics.views ?? null, p.metrics.reach ?? null, p.permalink ?? ""]),
  ]
  for (const [dim, items] of Object.entries(data.demographics)) {
    rows.push([], [dim, "Share %"], ...(items ?? []).map((i) => [i.label, i.share]))
  }
  download(rows, `gometric-analytics-${scope}-${range.start}_${range.end}.csv`)
}
