"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { useSelectedLayoutSegment } from "next/navigation"
import { Download, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { exportReport } from "@/components/dashboard/analytics/analytics-export"
import { DateRangePicker, fitsHistory, initialRange, rangeLabel, rangeParams, type RangeState } from "@/components/dashboard/analytics/date-range-picker"
import { NetworkTabs } from "@/components/dashboard/analytics/network-tabs"
import { PageHeader } from "@/components/dashboard/ui"
import { Button } from "@/components/ui/button"
import { isNetworkId, networks } from "@/config/networks"
import { analyticsHistoryDays } from "@/config/pricing"
import type { AnalyticsParams, AnalyticsRange } from "@/lib/api/types"
import { useAccounts } from "@/lib/queries/accounts"
import { useAnalyticsReport, useSyncAnalytics } from "@/lib/queries/analytics"
import { errorMessage } from "@/lib/api/errors"
import { useBilling } from "@/lib/queries/billing"

type AnalyticsPeriod = {
  params: AnalyticsParams
  range: AnalyticsRange
  label: string
}

const PeriodContext = createContext<AnalyticsPeriod | null>(null)

/** The date range chosen in the header. It lives in the layout, so it survives switching tabs. */
export function useAnalyticsPeriod() {
  const period = useContext(PeriodContext)
  if (!period) throw new Error("useAnalyticsPeriod must be used inside <AnalyticsShell>")
  return period
}

/**
 * Chrome shared by every analytics route: title, period picker, export, and the
 * route-driven tabs. `/dashboard/analytics` is the combined view and
 * `/dashboard/analytics/[network]` each network's own dashboard.
 */
export function AnalyticsShell({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment()
  const network = isNetworkId(segment) ? segment : null

  const [pickedRange, setPickedRange] = useState<RangeState>(initialRange)
  const { data: billing } = useBilling()
  // Until billing loads, don't restrict; a downgrade falls back to the default period.
  const historyDays = billing ? analyticsHistoryDays(billing.subscription.planId) : 365
  const rangeState = fitsHistory(pickedRange, historyDays) ? pickedRange : initialRange
  const params = rangeParams(rangeState)
  const range = params.range

  const { data: accounts } = useAccounts()
  const sync = useSyncAnalytics()

  // Same query keys as the pages below, so these share their cache; they only feed the export button.
  const report = useAnalyticsReport(network ? { ...params, network } : params)
  const canExport = !!report.data && report.data.accounts.length > 0

  function exportCsv() {
    if (report.data) exportReport(report.data, network ?? "all")
  }

  return (
    <PeriodContext.Provider value={{ params, range, label: rangeLabel(rangeState) }}>
      <PageHeader
        title="Analytics"
        description={
          network
            ? `${networks[network].name} performance, with the metrics that matter on that network.`
            : "Every connected network combined, so you can see what's working across channels."
        }
        actions={
          <>
            <DateRangePicker value={rangeState} onChange={setPickedRange} historyDays={historyDays} />
            <Button
              variant="outline"
              disabled={sync.isPending || !accounts?.some((a) => a.status !== "disconnected")}
              onClick={() =>
                sync.mutate(undefined, {
                  onSuccess: ({ results }) => {
                    const failed = results.find((r) => r.status === "failed")
                    if (failed) toast.error(failed.message ?? "Collection failed.")
                    else toast.success("Analytics refreshed")
                  },
                  onError: (e) => toast.error(errorMessage(e)),
                })
              }
            >
              <RefreshCw data-icon="inline-start" className={sync.isPending ? "animate-spin" : undefined} />
              {sync.isPending ? "Refreshing…" : "Refresh data"}
            </Button>
            <Button variant="outline" disabled={!canExport} onClick={exportCsv}>
              <Download data-icon="inline-start" />
              Export CSV
            </Button>
          </>
        }
      />

      <NetworkTabs value={network ?? "all"} accounts={accounts} />

      {children}
    </PeriodContext.Provider>
  )
}
