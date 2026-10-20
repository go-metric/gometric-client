"use client"

import { queryOptions, useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query"
import type { NetworkId } from "@/config/networks"
import { postsApi } from "@/lib/api/posts"
import type { Post, PostInput, PostListParams } from "@/lib/api/types"
import { queryKeys } from "@/lib/queries/keys"

export const postListOptions = (params: PostListParams = {}) =>
  queryOptions({
    queryKey: queryKeys.posts.list(params),
    queryFn: () => postsApi.list(params),
    // Posts waiting on a retry or mid-delivery update without a manual refresh.
    refetchInterval: (query) => (query.state.data?.some((p) => p.status === "publishing") ? 5_000 : false),
  })

export const postOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.posts.detail(id),
    queryFn: () => postsApi.get(id),
  })

export const usePosts = (params: PostListParams = {}, options: { enabled?: boolean } = {}) =>
  useQuery({ ...postListOptions(params), ...options })

export const usePost = (id: string | null) => useQuery({ ...postOptions(id ?? ""), enabled: !!id })

function invalidatePosts(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.posts.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  ])
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: PostInput) => postsApi.create(input),
    onSettled: () => invalidatePosts(queryClient),
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<PostInput> }) => postsApi.update(id, patch),
    onSettled: () => invalidatePosts(queryClient),
  })
}

export function usePublishPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => postsApi.publishNow(id),
    onSettled: () => invalidatePosts(queryClient),
  })
}

export function useDuplicatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => postsApi.duplicate(id),
    onSettled: () => invalidatePosts(queryClient),
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, platform }: { id: string; platform?: boolean }) => postsApi.remove(id, { platform }),
    onSettled: () => invalidatePosts(queryClient),
  })
}

export function useRetryPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, networks }: { id: string; networks?: NetworkId[] }) => postsApi.retry(id, networks),
    onSettled: () => invalidatePosts(queryClient),
  })
}

export function useRemoveFromNetwork() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, network }: { id: string; network: NetworkId }) => postsApi.removeFromNetwork(id, network),
    onSettled: () => invalidatePosts(queryClient),
  })
}

export const usePostLogs = (id: string | null, enabled = true) =>
  useQuery({ queryKey: ["posts", "logs", id], queryFn: () => postsApi.logs(id!), enabled: !!id && enabled })

/** Boards the connected Pinterest account can pin to. Only fetched when Pinterest is selected. */
export const usePinterestBoards = (enabled: boolean) =>
  useQuery({ queryKey: ["posts", "pinterest-boards"], queryFn: () => postsApi.pinterestBoards(), enabled, staleTime: 5 * 60_000, retry: false })

/** Creates a Pinterest board and refreshes the board list so the new one can be chosen straight away. */
export function useCreatePinterestBoard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { name: string; privacy: "PUBLIC" | "SECRET" }) => postsApi.createPinterestBoard(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts", "pinterest-boards"] }),
  })
}

/** Optimistic so drag-and-drop on the planner feels instant. */
export function useReschedulePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, scheduledAt }: { id: string; scheduledAt: string }) => postsApi.reschedule(id, scheduledAt),
    onMutate: async ({ id, scheduledAt }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.all })
      const previous = queryClient.getQueriesData<Post[]>({ queryKey: ["posts", "list"] })
      queryClient.setQueriesData<Post[]>({ queryKey: ["posts", "list"] }, (posts) =>
        posts?.map((p) => (p.id === id ? { ...p, scheduledAt } : p))
      )
      return { previous }
    },
    onError: (_error, _vars, context) => {
      for (const [key, data] of context?.previous ?? []) queryClient.setQueryData(key, data)
    },
    onSettled: () => invalidatePosts(queryClient),
  })
}
