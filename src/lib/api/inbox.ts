import { api } from "@/lib/api/http"
import type { Conversation, ConversationStatus } from "@/lib/api/types"

export const inboxApi = {
  list() {
    return api<Conversation[]>("/conversations")
  },

  setUnread(id: string, unread: boolean) {
    return api<Conversation>(`/conversations/${id}/unread`, {
      method: "PATCH",
      body: JSON.stringify({ unread }),
    })
  },

  setStatus(id: string, status: ConversationStatus) {
    return api<Conversation>(`/conversations/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  },

  reply(id: string, text: string) {
    return api<Conversation>(`/conversations/${id}/replies`, {
      method: "POST",
      body: JSON.stringify({ text }),
    })
  },
}
