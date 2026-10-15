"use client"

import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notificationsApi } from "@/lib/api/notifications"
import type { AppNotification } from "@/lib/api/types"
import { queryKeys } from "@/lib/queries/keys"

export const notificationsOptions = () =>
  queryOptions({
    queryKey: queryKeys.notifications,
    queryFn: () => notificationsApi.list(),
    refetchInterval: 60_000,
  })

export const useNotifications = () => useQuery(notificationsOptions())

function useNotificationMutation<TVars>(
  mutationFn: (vars: TVars) => Promise<unknown>,
  apply: (items: AppNotification[], vars: TVars) => AppNotification[]
) {
  const queryClient = useQueryClient()
  const key = queryKeys.notifications
  return useMutation({
    mutationFn,
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<AppNotification[]>(key)
      queryClient.setQueryData<AppNotification[]>(key, (items) => (items ? apply(items, vars) : items))
      return { previous }
    },
    onError: (_error, _vars, context) => queryClient.setQueryData(key, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}

export const useMarkNotificationRead = () =>
  useNotificationMutation(
    (id: string) => notificationsApi.markRead(id),
    (items, id) => items.map((n) => (n.id === id ? { ...n, read: true } : n))
  )

export const useMarkAllNotificationsRead = () =>
  useNotificationMutation(
    () => notificationsApi.markAllRead(),
    (items) => items.map((n) => ({ ...n, read: true }))
  )
