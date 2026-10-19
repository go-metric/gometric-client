import { http } from "@/lib/api/http"
import type { AnalyticsParams, AnalyticsReport, SyncOutcome } from "@/lib/api/types"

export const analyticsApi = {
  report: ({ range, end, network, accountId }: AnalyticsParams) =>
    http.get<AnalyticsReport>("/analytics", { query: { range, end, network, accountId } }),

  /** Collects fresh metrics from the platforms now (otherwise they refresh every few hours). */
  sync: () => http.post<{ results: Pick<SyncOutcome, "accountId" | "network" | "status" | "message">[] }>("/analytics/sync"),
}
