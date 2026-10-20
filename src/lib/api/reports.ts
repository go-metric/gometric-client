import { api, apiDownload, toQuery } from "@/lib/api/http"
import type { ReportPdfParams, ReportSchedule, ReportScheduleInput } from "@/lib/api/types"

export const reportsApi = {
  /** A one-off PDF for the chosen period. */
  pdf: ({ range, end, network, sections }: ReportPdfParams) =>
    apiDownload(`/reports/pdf${toQuery({ range, end, network, sections: sections?.join(",") })}`),

  schedules: () => api<ReportSchedule[]>("/reports/schedules"),
  createSchedule: (input: ReportScheduleInput) => api<ReportSchedule>("/reports/schedules", { method: "POST", body: JSON.stringify(input) }),
  updateSchedule: (id: string, patch: Partial<ReportScheduleInput>) =>
    api<ReportSchedule>(`/reports/schedules/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteSchedule: (id: string) => api<void>(`/reports/schedules/${id}`, { method: "DELETE" }),
  /** Emails the report to the signed-in user only. */
  sendTest: (id: string) => api<{ sentTo: string }>(`/reports/schedules/${id}/test`, { method: "POST" }),
}

/** Saves a downloaded file through a temporary link. */
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
