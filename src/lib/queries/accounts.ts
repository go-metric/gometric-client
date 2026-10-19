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

/** Starts the provider OAuth flow: navigates the browser away to the consent screen. */
export async function startOAuth(network: NetworkId) {
  const redirectUrl = await accountsApi.oauthStart(network)
  window.location.assign(redirectUrl)
}

/** Refreshes the token in place where the network supports it, otherwise re-runs OAuth consent. */
export const useReconnectAccount = () =>
  useAccountMutation(async (network: NetworkId) => {
    try {
      return await accountsApi.reconnect(network)
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) return startOAuth(network)
      throw error
    }
  })

export const useDisconnectAccount = () => useAccountMutation((network: NetworkId) => accountsApi.disconnect(network))
