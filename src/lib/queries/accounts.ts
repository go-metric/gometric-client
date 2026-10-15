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

export const useConnectAccount = () =>
  useAccountMutation(({ network, handle }: { network: NetworkId; handle: string }) =>
    accountsApi.connect(network, handle)
  )

export const useReconnectAccount = () => useAccountMutation((network: NetworkId) => accountsApi.reconnect(network))

export const useDisconnectAccount = () => useAccountMutation((network: NetworkId) => accountsApi.disconnect(network))
