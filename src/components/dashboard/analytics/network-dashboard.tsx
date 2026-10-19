"use client"

import { format, parseISO } from "date-fns"
import { BarChart3, Info, Link2 } from "lucide-react"
import { BestTimePanel, DemographicsPanels, PublishingPanel, SourceNotes, TopPostsPanel, TrendPanel } from "@/components/dashboard/analytics/report-widgets"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { EmptyState, Panel } from "@/components/dashboard/ui"
import { ProgressBar } from "@/components/charts"
import { ButtonLink } from "@/components/ui/button"
import { networkThemes } from "@/config/network-themes"
import { networks, type NetworkId } from "@/config/networks"
import { routes } from "@/config/site"
import type { AnalyticsReport, Metric } from "@/lib/api/types"
import { formatCompact } from "@/lib/format"

const interactionLabels: Record<string, string> = {
  likes: "Likes",
  comments: "Comments",
  shares: "Shares",
  saves: "Saves",
  replies: "Replies",
  reposts: "Reposts",
  quotes: "Quotes",
}

export function NetworkDashboard({ network, data, rangeLabel }: { network: NetworkId; data: AnalyticsReport | undefined; rangeLabel: string }) {
  const name = networks[network].name
  const accent = networkThemes[network].accent

  if (data && data.accounts.length === 0) {
    const unsupported = data.unsupported.find((u) => u.network === network)
    return (
      <Panel>
        <EmptyState
          icon={unsupported ? <Info /> : <Link2 />}
          title={unsupported ? `${name} analytics aren't available` : `${name} isn't connected`}
          description={unsupported?.reason ?? `Connect ${name} to see its performance here.`}
          action={unsupported ? undefined : <ButtonLink href={routes.dashboard.accounts}>Connect {name}</ButtonLink>}
        />
      </Panel>
    )
  }

  const account = data?.accounts[0]
  const kpis: Metric[] | undefined = account
    ? [
        {
          id: "followers",
          label: "Followers",
          format: "number",
          value: account.followers.value,
          previous: null,
          change: account.followers.growthRate,
          note: account.followers.note,
        },
        ...account.metrics.filter((m) => m.id !== "accounts_engaged" || m.value !== null),
        {
          id: "engagement",
          label: "Engagement rate",
          format: "percent",
          value: account.engagement.rate,
          previous: account.engagement.previousRate,
          change: account.engagement.change,
          note: account.engagement.rate === null ? account.engagement.note : `Interactions ÷ ${account.engagement.basis} on ${account.engagement.posts} posts`,
        },
        {
          id: "posts",
          label: "Posts published",
          format: "number",
          value: account.publishedPosts,
          previous: account.publishedPostsPrevious,
          change: null,
        },
      ]
    : undefined

  const interactions = account ? Object.entries(interactionLabels).filter(([id]) => account.interactions[id] != null) : []
  const maxInteraction = Math.max(...interactions.map(([id]) => account?.interactions[id] ?? 0), 1)

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {name} {account?.handle} · {rangeLabel}
        {account?.trackingSince ? ` · tracking since ${format(parseISO(account.trackingSince), "MMM d, yyyy")}` : ""}
      </p>
      <KpiCards kpis={kpis} skeletons={6} className="sm:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4" />

      <TrendPanel accounts={data?.accounts} loading={!data} title={`${name} trends`} />

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Interactions on posts in this period" className="xl:col-span-1">
          {!account ? (
            <div className="h-40 animate-pulse rounded-2xl bg-muted" />
          ) : interactions.length === 0 ? (
            <EmptyState icon={<BarChart3 />} title="No interaction data" description={account.engagement.note ?? "The platform hasn't reported likes or comments for posts in this period."} />
          ) : (
            <ul className="space-y-3.5">
              {interactions.map(([id, label]) => (
                <li key={id}>
                  <div className="mb-1.5 flex justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold">{formatCompact(account.interactions[id] ?? 0)}</span>
                  </div>
                  <ProgressBar value={((account.interactions[id] ?? 0) / maxInteraction) * 100} color={accent} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <div className="xl:col-span-1">
          <PublishingPanel report={data} />
        </div>
        <div className="xl:col-span-1">
          <BestTimePanel report={data} />
        </div>
      </div>

      <DemographicsPanels report={data} />

      <TopPostsPanel posts={data?.topPosts} title={`Best-performing ${name} posts`} />

      <SourceNotes report={data} />
    </div>
  )
}
