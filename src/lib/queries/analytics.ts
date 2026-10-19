"use client"

import { keepPreviousData, queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { analyticsApi } from "@/lib/api/analytics"
import type { AnalyticsParams } from "@/lib/api/types"
import { queryKeys } from "@/lib/queries/keys"

export const analyticsOptions = (params: AnalyticsParams) =>
  queryOptions({
    queryKey: queryKeys.analytics.report(params),
    queryFn: () => analyticsApi.report(params),
    staleTime: 2 * 60_000,
  })

/** One report for the whole brand, or for one network via `params.network`. Keeps the previous range on screen while the next loads. */
export const useAnalyticsReport = (params: AnalyticsParams, enabled = true) =>
  useQuery({
    ...analyticsOptions(params),
    enabled,
    placeholderData: (previous) => (previous && previous.accounts.every((a) => !params.network || a.network === params.network) ? previous : undefined),
  })

export function useSyncAnalytics() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => analyticsApi.sync(),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all }),
  })
}

export { keepPreviousData }
