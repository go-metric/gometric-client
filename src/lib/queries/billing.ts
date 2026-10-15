"use client"

import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  billingApi,
  type ChangePlanInput,
  type UpdatePaymentMethodInput,
} from "@/lib/api/billing"
import type { BillingDetails, BillingSnapshot } from "@/lib/api/types"
import { queryKeys } from "@/lib/queries/keys"

export const billingOptions = () =>
  queryOptions({
    queryKey: queryKeys.billing,
    queryFn: () => billingApi.get(),
    staleTime: 30_000,
  })

export const useBilling = () => useQuery(billingOptions())

function useBillingMutation<TVars>(mutationFn: (vars: TVars) => Promise<BillingSnapshot>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (billing) => {
      queryClient.setQueryData(queryKeys.billing, billing)
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
    },
  })
}

export const useChangePlan = () =>
  useBillingMutation((input: ChangePlanInput) => billingApi.changePlan(input))

export const useCancelScheduledChange = () =>
  useBillingMutation(() => billingApi.cancelScheduledChange())

export const useUpdatePaymentMethod = () =>
  useBillingMutation((input: UpdatePaymentMethodInput) => billingApi.updatePaymentMethod(input))

export function useUpdateBillingDetails() {
  const queryClient = useQueryClient()
  const key = queryKeys.billing
  return useMutation({
    mutationFn: (patch: Partial<BillingDetails>) => billingApi.updateBillingDetails(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<BillingSnapshot>(key)
      if (previous) {
        queryClient.setQueryData<BillingSnapshot>(key, {
          ...previous,
          billingDetails: { ...previous.billingDetails, ...patch },
        })
      }
      return { previous }
    },
    onError: (_error, _patch, context) => queryClient.setQueryData(key, context?.previous),
    onSuccess: (billing) => queryClient.setQueryData(key, billing),
  })
}

export const useCancelSubscription = () => useBillingMutation(() => billingApi.cancelSubscription())

export const useResumeSubscription = () => useBillingMutation(() => billingApi.resumeSubscription())
