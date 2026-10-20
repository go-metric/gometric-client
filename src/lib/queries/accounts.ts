"use client"

import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { NetworkId } from "@/config/networks"
import { accountsApi } from "@/lib/api/accounts"
import { ApiError } from "@/lib/api/errors"
import { queryKeys } from "@/lib/queries/keys"

export const accountsOptions = () =>
  queryOptions({
    queryKey: queryKeys.accounts,
    queryFn: () => accountsApi.list(),
  })

export const useAccounts = () => useQuery(accountsOptions())

/** Connected accounts (including ones needing reconnection, so the composer can say why they're unusable). */
export const useLinkedAccounts = () =>
  useQuery({
    ...accountsOptions(),
    select: (accounts) => accounts.filter((a) => a.status !== "disconnected" && a.available !== false),
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
        queryClient.invalidateQueries({ queryKey: queryKeys.inbox.all }),
      ]),
  })
}

/** Networks whose tokens the service can refresh in place; everything else reauthorizes via OAuth. */
const REFRESHABLE_NETWORKS = new Set<NetworkId>(["x", "tiktok", "pinterest"])

/** Starts OAuth and navigates the browser to the provider's consent screen. */
export function useStartOAuth() {
  return useMutation({
    mutationFn: async (input: NetworkId | { network: NetworkId; sandbox?: boolean }) => {
      const { network, sandbox } = typeof input === "string" ? { network: input, sandbox: false } : input
      const redirectUrl = await accountsApi.startOAuth(network, { sandbox })
      window.location.href = redirectUrl
      return redirectUrl
    },
  })
}

/**
 * Reconnects an account. Refreshable networks try an in-place token refresh first; if that isn't
 * possible (revoked, expired, unsupported) or the network can't refresh, the user reauthorizes
 * through OAuth (`redirected: true`; the success toast comes from `?connected=` on return).
 */
export function useReconnectAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (network: NetworkId) => {
      const reauthorize = async () => {
        window.location.href = await accountsApi.startOAuth(network)
        return { redirected: true as const }
      }
      if (!REFRESHABLE_NETWORKS.has(network)) return reauthorize()
      try {
        await accountsApi.reconnect(network)
        return { redirected: false as const }
      } catch (error) {
        if (error instanceof ApiError && [400, 401, 409, 503].includes(error.status)) return reauthorize()
        throw error
      }
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts }),
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.posts.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inbox.all }),
      ]),
  })
}

/** Include or exclude an account from the inbox and analytics. */
export const useSetAccountPreferences = () =>
  useAccountMutation(({ network, ...prefs }: { network: NetworkId; inbox?: boolean; analytics?: boolean }) =>
    accountsApi.setPreferences(network, prefs)
  )

export const useDisconnectAccount = () => useAccountMutation((network: NetworkId) => accountsApi.disconnect(network))

/** Live TikTok profile; only fetched while the TikTok analytics tab is open and the account is connected. */
export const useTikTokProfile = (enabled = true) =>
  useQuery({ queryKey: queryKeys.tiktok.profile, queryFn: () => accountsApi.tiktokProfile(), enabled, staleTime: 30_000, retry: false })

export const useTikTokVideos = (enabled = true) =>
  useQuery({ queryKey: queryKeys.tiktok.videos, queryFn: () => accountsApi.tiktokVideos(), enabled, staleTime: 30_000, retry: false })
