"use client"

import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { activeBrand, workspaceApi } from "@/lib/api/workspace"
import type { Brand, NotificationPrefs, Profile, Workspace } from "@/lib/api/types"
import { queryKeys } from "@/lib/queries/keys"

export const workspaceOptions = () =>
  queryOptions({
    queryKey: queryKeys.workspace,
    queryFn: () => workspaceApi.get(),
    staleTime: 5 * 60_000,
  })

export const useWorkspace = () => useQuery(workspaceOptions())

export function useActiveBrand() {
  return useQuery({
    ...workspaceOptions(),
    select: (workspace) => activeBrand(workspace),
  })
}

function invalidateBrandScoped(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.workspace }),
    queryClient.invalidateQueries({ queryKey: queryKeys.accounts }),
    queryClient.invalidateQueries({ queryKey: queryKeys.posts.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.conversations }),
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.billing }),
  ])
}

export function useCreateBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Omit<Brand, "id">) => workspaceApi.createBrand(input),
    onSuccess: (workspace) => {
      queryClient.setQueryData(queryKeys.workspace, workspace)
      return invalidateBrandScoped(queryClient)
    },
  })
}

export function useUpdateBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...patch }: Partial<Omit<Brand, "id">> & { id: string }) =>
      workspaceApi.updateBrand(id, patch),
    onSuccess: (workspace) => queryClient.setQueryData(queryKeys.workspace, workspace),
  })
}

export function useDeleteBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (brandId: string) => workspaceApi.deleteBrand(brandId),
    onSuccess: (workspace) => {
      queryClient.setQueryData(queryKeys.workspace, workspace)
      return invalidateBrandScoped(queryClient)
    },
  })
}

export function useSetActiveBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (brandId: string) => workspaceApi.setActiveBrand(brandId),
    onMutate: async (brandId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.workspace })
      const previous = queryClient.getQueryData<Workspace>(queryKeys.workspace)
      if (previous) {
        queryClient.setQueryData<Workspace>(queryKeys.workspace, {
          ...previous,
          activeBrandId: brandId,
        })
      }
      return { previous }
    },
    onError: (_error, _id, context) => queryClient.setQueryData(queryKeys.workspace, context?.previous),
    onSuccess: (workspace) => {
      queryClient.setQueryData(queryKeys.workspace, workspace)
      return invalidateBrandScoped(queryClient)
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<Profile>) => workspaceApi.updateProfile(patch),
    onSuccess: (workspace) => queryClient.setQueryData(queryKeys.workspace, workspace),
  })
}

/** Optimistic so switches flip immediately. */
export function useUpdateNotificationPrefs() {
  const queryClient = useQueryClient()
  const key = queryKeys.workspace
  return useMutation({
    mutationFn: (patch: Partial<NotificationPrefs>) => workspaceApi.updateNotificationPrefs(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Workspace>(key)
      if (previous) {
        queryClient.setQueryData<Workspace>(key, {
          ...previous,
          notificationPrefs: { ...previous.notificationPrefs, ...patch },
        })
      }
      return { previous }
    },
    onError: (_error, _patch, context) => queryClient.setQueryData(key, context?.previous),
    onSuccess: (workspace) => queryClient.setQueryData(key, workspace),
  })
}
