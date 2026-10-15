"use client"

import { queryOptions, useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query"
import { postsApi } from "@/lib/api/posts"
import type { Post, PostInput, PostListParams } from "@/lib/api/types"
import { queryKeys } from "@/lib/queries/keys"

export const postListOptions = (params: PostListParams = {}) =>
  queryOptions({
    queryKey: queryKeys.posts.list(params),
    queryFn: () => postsApi.list(params),
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
    mutationFn: (id: string) => postsApi.remove(id),
    onSettled: () => invalidatePosts(queryClient),
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
