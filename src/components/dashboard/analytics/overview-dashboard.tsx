"use client"

import { BarChart3 } from "lucide-react"
import { BestTimePanel, ComparisonTable, DemographicsPanels, PublishingPanel, SourceNotes, TopPostsPanel, TrendPanel } from "@/components/dashboard/analytics/report-widgets"
import { EmptyState, ListSkeleton, Panel } from "@/components/dashboard/ui"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { ButtonLink } from "@/components/ui/button"
import { routes } from "@/config/site"
import type { AnalyticsReport } from "@/lib/api/types"

export function OverviewDashboard({ data }: { data: AnalyticsReport | undefined }) {
  if (data && data.accounts.length === 0) {
    return (
      <Panel>
        <EmptyState
          icon={<BarChart3 />}
          title={data.unsupported.length ? "No networks with analytics" : "No linked accounts"}
          description={
            data.unsupported.length
              ? "None of your connected networks provide analytics through their API."
              : "Connect a network to see how your channels perform together."
          }
          action={<ButtonLink href={routes.dashboard.accounts}>Connect a network</ButtonLink>}
        />
      </Panel>
    )
  }

  return (
    <div className="space-y-4">
      <KpiCards kpis={data?.kpis} skeletons={6} className="sm:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6" />

      <TrendPanel accounts={data?.accounts} loading={!data} title="Trends by network" />

      <Panel title="Network comparison" bodyClassName="px-0 pb-2 sm:px-0">
        {data ? <ComparisonTable accounts={data.accounts} /> : <ListSkeleton rows={4} className="px-5 sm:px-6" />}
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <PublishingPanel report={data} />
        <BestTimePanel report={data} />
      </div>

      <DemographicsPanels report={data} />

      <TopPostsPanel posts={data?.topPosts} title="Best-performing posts across networks" />

      <SourceNotes report={data} />
    </div>
  )
}
