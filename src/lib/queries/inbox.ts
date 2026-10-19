"use client"

import { infiniteQueryOptions, queryOptions, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { inboxApi } from "@/lib/api/inbox"
import type { Conversation, ConversationFilters, ConversationStatus } from "@/lib/api/types"
import { queryKeys } from "@/lib/queries/keys"

/** New activity should show up without a manual refresh; webhooks/polling keep the server fresh. */
const POLL_MS = 30_000

export const conversationListOptions = (filters: ConversationFilters) =>
  infiniteQueryOptions({
    queryKey: queryKeys.inbox.list(filters),
    queryFn: ({ pageParam }) => inboxApi.list({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    refetchInterval: POLL_MS,
  })

export const useConversationList = (filters: ConversationFilters) => useInfiniteQuery(conversationListOptions(filters))

export const conversationDetailOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.inbox.detail(id),
    queryFn: () => inboxApi.get(id),
    refetchInterval: POLL_MS,
  })

export const useConversation = (id: string | null) =>
  useQuery({ ...conversationDetailOptions(id ?? ""), enabled: !!id })

/** A single small page, for dashboard widgets and global search. */
export const useConversationPreview = (filters: ConversationFilters, enabled = true) =>
  useQuery({
    queryKey: queryKeys.inbox.preview(filters),
    queryFn: () => inboxApi.list(filters),
    refetchInterval: POLL_MS,
    enabled,
  })

export const useUnreadCount = () =>
  useQuery({
    queryKey: queryKeys.inbox.preview({ limit: 1 }),
    queryFn: () => inboxApi.list({ limit: 1 }),
    refetchInterval: POLL_MS,
    select: (page) => page.unreadTotal,
  })

export const useInboxMembers = () => useQuery({ queryKey: queryKeys.inbox.members, queryFn: () => inboxApi.members(), staleTime: 5 * 60_000 })

function useConversationMutation<TVars extends { id: string }>(mutationFn: (vars: TVars) => Promise<Conversation>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (conversation) => {
      queryClient.setQueryData(queryKeys.inbox.detail(conversation.id), conversation)
      return queryClient.invalidateQueries({ queryKey: queryKeys.inbox.all })
    },
  })
}

export const useSetUnread = () => useConversationMutation(({ id, unread }: { id: string; unread: boolean }) => inboxApi.setUnread(id, unread))

export const useSetConversationStatus = () =>
  useConversationMutation(({ id, status }: { id: string; status: ConversationStatus }) => inboxApi.setStatus(id, status))

export const useSetAssignee = () =>
  useConversationMutation(({ id, userId }: { id: string; userId: string | null }) => inboxApi.setAssignee(id, userId))

export const useAddNote = () => useConversationMutation(({ id, text }: { id: string; text: string }) => inboxApi.addNote(id, text))

/** Only resolves once the platform has confirmed the reply. */
export const useReply = () => useConversationMutation(({ id, text }: { id: string; text: string }) => inboxApi.reply(id, text))

export function useSyncInbox() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => inboxApi.sync(),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.inbox.all }),
  })
}
