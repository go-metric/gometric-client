"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { reportsApi } from "@/lib/api/reports"
import type { ReportPdfParams, ReportScheduleInput } from "@/lib/api/types"
import { queryKeys } from "@/lib/queries/keys"

export const useReportSchedules = () => useQuery({ queryKey: [...queryKeys.reports, "schedules"], queryFn: () => reportsApi.schedules(), staleTime: 30_000 })

export function useDownloadReport() {
  return useMutation({ mutationFn: (params: ReportPdfParams) => reportsApi.pdf(params) })
}

function useInvalidating<TVars, TData>(fn: (vars: TVars) => Promise<TData>) {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: fn, onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.reports }) })
}

export const useCreateSchedule = () => useInvalidating((input: ReportScheduleInput) => reportsApi.createSchedule(input))
export const useUpdateSchedule = () => useInvalidating((v: { id: string; patch: Partial<ReportScheduleInput> }) => reportsApi.updateSchedule(v.id, v.patch))
export const useDeleteSchedule = () => useInvalidating((id: string) => reportsApi.deleteSchedule(id))
export const useSendTestReport = () => useMutation({ mutationFn: (id: string) => reportsApi.sendTest(id) })
