"use client"

import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query"
import { analyticsApi } from "@/lib/api/analytics"
import type { AnalyticsParams, NetworkAnalyticsParams } from "@/lib/api/types"
import { queryKeys } from "@/lib/queries/keys"

export const analyticsOptions = (params: AnalyticsParams) =>
  queryOptions({
    queryKey: queryKeys.analytics.summary(params),
    queryFn: () => analyticsApi.summary(params),
    staleTime: 5 * 60_000,
  })

export const networkAnalyticsOptions = (params: NetworkAnalyticsParams) =>
  queryOptions({
    queryKey: queryKeys.analytics.network(params),
    queryFn: () => analyticsApi.network(params),
    staleTime: 5 * 60_000,
  })

/** Combined analytics. Keeps the previous range on screen while the next one loads; `enabled: false` skips the request on a network's own page. */
export const useAnalytics = (params: AnalyticsParams, enabled = true) =>
  useQuery({ ...analyticsOptions(params), enabled, placeholderData: keepPreviousData })

/** One network's analytics; `enabled: false` skips the request on the combined page. */
export const useNetworkAnalytics = (params: NetworkAnalyticsParams, enabled = true) =>
  useQuery({
    ...networkAnalyticsOptions(params),
    enabled,
    // Only carry data over within the same network, so a themed page never shows another network's numbers.
    placeholderData: (previous) => (previous?.network === params.network ? previous : undefined),
  })
