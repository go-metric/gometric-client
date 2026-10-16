import type { NetworkId } from "@/config/networks"
import { api, toQuery } from "@/lib/api/http"
import type {
  AnalyticsParams,
  AnalyticsSummary,
  NetworkAnalytics,
  NetworkAnalyticsParams,
} from "@/lib/api/types"

export const analyticsApi = {
  summary(params: AnalyticsParams) {
    return api<AnalyticsSummary>(`/analytics/summary${toQuery(params)}`)
  },

  network({ network, ...params }: NetworkAnalyticsParams) {
    return api<NetworkAnalytics>(`/analytics/networks/${network as NetworkId}${toQuery(params)}`)
  },
}
