import { http } from "@/lib/api/http"
import type { AppNotification } from "@/lib/api/types"

export const notificationsApi = {
  list: () => http.get<AppNotification[]>("/notifications", { noBrand: true }),
  markRead: (id: string) => http.post<void>(`/notifications/${id}/read`, undefined, { noBrand: true }),
  markAllRead: () => http.post<void>("/notifications/read-all", undefined, { noBrand: true }),
}
