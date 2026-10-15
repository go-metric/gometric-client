"use client"

import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { inboxApi } from "@/lib/api/inbox"
import type { Conversation } from "@/lib/api/types"
import { queryKeys } from "@/lib/queries/keys"

export const conversationsOptions = () =>
  queryOptions({
    queryKey: queryKeys.conversations,
    queryFn: () => inboxApi.list(),
    refetchInterval: 60_000,
  })

export const useConversations = () => useQuery(conversationsOptions())

export const useUnreadCount = () =>
  useQuery({
    ...conversationsOptions(),
    select: (items) => items.filter((c) => c.unread && c.status === "open").length,
  })

/** Patches one conversation in the cache immediately, rolling back on failure. */
function useOptimisticConversation<TVars extends { id: string }>(
  mutationFn: (vars: TVars) => Promise<Conversation>,
  apply: (conversation: Conversation, vars: TVars) => Conversation
) {
  const queryClient = useQueryClient()
  const key = queryKeys.conversations
  return useMutation({
    mutationFn,
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Conversation[]>(key)
      queryClient.setQueryData<Conversation[]>(key, (items) =>
        items?.map((c) => (c.id === vars.id ? apply(c, vars) : c))
      )
      return { previous }
    },
    onError: (_error, _vars, context) => queryClient.setQueryData(key, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}

export const useSetUnread = () =>
  useOptimisticConversation(
    ({ id, unread }: { id: string; unread: boolean }) => inboxApi.setUnread(id, unread),
    (c, { unread }) => ({ ...c, unread })
  )

export const useSetConversationStatus = () =>
  useOptimisticConversation(
    ({ id, status }: { id: string; status: Conversation["status"] }) => inboxApi.setStatus(id, status),
    (c, { status }) => ({ ...c, status, unread: false })
  )

export function useReply() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => inboxApi.reply(id, text),
    onSuccess: (conversation) =>
      queryClient.setQueryData<Conversation[]>(queryKeys.conversations, (items) =>
        items?.map((c) => (c.id === conversation.id ? conversation : c))
      ),
  })
}
