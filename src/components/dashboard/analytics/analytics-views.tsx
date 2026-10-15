"use client"

import { useAnalyticsPeriod } from "@/components/dashboard/analytics/analytics-shell"
import { NetworkDashboard } from "@/components/dashboard/analytics/network-dashboard"
import { OverviewDashboard } from "@/components/dashboard/analytics/overview-dashboard"
import { ErrorState, Panel } from "@/components/dashboard/ui"
import type { NetworkId } from "@/config/networks"
import { useAnalytics, useNetworkAnalytics } from "@/lib/queries/analytics"
import { cn } from "@/lib/utils"

/** `/dashboard/analytics`: every connected network combined. */
export function OverviewView() {
  const { params, range } = useAnalyticsPeriod()
  const { data, error, isPlaceholderData, refetch } = useAnalytics(params)

  if (error) {
    return (
      <Panel>
        <ErrorState error={error} onRetry={() => refetch()} />
      </Panel>
    )
  }

  return (
    <div className={cn("transition-opacity", isPlaceholderData && "opacity-60")}>
      <OverviewDashboard data={data} range={range} />
    </div>
  )
}

/** `/dashboard/analytics/[network]`: one network's own dashboard. */
export function NetworkView({ network }: { network: NetworkId }) {
  const { params, range, label } = useAnalyticsPeriod()
  const { data, error, isPlaceholderData, refetch } = useNetworkAnalytics({ ...params, network })

  if (error) {
    return (
      <Panel>
        <ErrorState error={error} onRetry={() => refetch()} />
      </Panel>
    )
  }

  return (
    <div className={cn("transition-opacity", isPlaceholderData && "opacity-60")}>
      <NetworkDashboard key={network} network={network} data={data} range={range} rangeLabel={label} />
    </div>
  )
}
