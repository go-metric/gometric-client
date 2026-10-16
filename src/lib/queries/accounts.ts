"use client"

import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { NetworkId } from "@/config/networks"
import { accountsApi } from "@/lib/api/accounts"
import { queryKeys } from "@/lib/queries/keys"

export const accountsOptions = () =>
  queryOptions({
    queryKey: queryKeys.accounts,
    queryFn: () => accountsApi.list(),
  })

export const useAccounts = () => useQuery(accountsOptions())

/** Networks the brand can currently publish to. */
export const useLinkedAccounts = () =>
  useQuery({
    ...accountsOptions(),
    select: (accounts) => accounts.filter((a) => a.status !== "disconnected"),
  })

function useAccountMutation<TVars>(mutationFn: (vars: TVars) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts }),
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.posts.all }),
      ]),
  })
}

/** Meta networks reject `POST …/reconnect` — must run OAuth again. */
const OAUTH_RECONNECT_NETWORKS = new Set<NetworkId>(["facebook", "instagram", "threads"])

/** Starts OAuth and navigates to the provider (or mock callback) URL. */
export function useStartOAuth() {
  return useMutation({
    mutationFn: async (network: NetworkId) => {
      const redirectUrl = await accountsApi.startOAuth(network)
      window.location.href = redirectUrl
      return redirectUrl
    },
  })
}

/**
 * Refreshes a connection. X + mock networks use `POST …/reconnect`;
 * Facebook / Instagram / Threads open OAuth again (`redirected: true`).
 */
export function useReconnectAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (network: NetworkId) => {
      if (OAUTH_RECONNECT_NETWORKS.has(network)) {
        const redirectUrl = await accountsApi.startOAuth(network)
        window.location.href = redirectUrl
        return { redirected: true as const }
      }
      await accountsApi.reconnect(network)
      return { redirected: false as const }
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts }),
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.posts.all }),
      ]),
  })
}

export const useDisconnectAccount = () => useAccountMutation((network: NetworkId) => accountsApi.disconnect(network))
