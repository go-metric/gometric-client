import { api, toQuery } from "@/lib/api/http"
import type { AnalyticsParams, AnalyticsReport, SyncOutcome } from "@/lib/api/types"

export const analyticsApi = {
  report: ({ range, end, network, accountId }: AnalyticsParams) =>
    api<AnalyticsReport>(`/analytics${toQuery({ range, end, network, accountId })}`),

  /** Collects fresh metrics from the platforms now (otherwise they refresh every few hours). */
  sync: () => api<{ results: Pick<SyncOutcome, "accountId" | "network" | "status" | "message">[] }>("/analytics/sync", { method: "POST" }),
}
