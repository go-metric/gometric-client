import { api } from "@/lib/api/http"
import type { AppNotification } from "@/lib/api/types"

export const notificationsApi = {
  list() {
    return api<AppNotification[]>("/notifications")
  },

  markRead(id: string) {
    return api<void>(`/notifications/${id}/read`, { method: "POST" })
  },

  markAllRead() {
    return api<void>("/notifications/read-all", { method: "POST" })
  },
}
