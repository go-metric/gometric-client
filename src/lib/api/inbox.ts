import { http } from "@/lib/api/http"
import type {
  Conversation,
  ConversationFilters,
  ConversationPage,
  ConversationStatus,
  SyncOutcome,
  WorkspaceMemberSummary,
} from "@/lib/api/types"

export const inboxApi = {
  list: (filters: ConversationFilters = {}) =>
    http.get<ConversationPage>("/conversations", { query: { ...filters } }),
  get: (id: string) => http.get<Conversation>(`/conversations/${id}`),
  setUnread: (id: string, unread: boolean) => http.patch<Conversation>(`/conversations/${id}/unread`, { unread }),
  setStatus: (id: string, status: ConversationStatus) => http.patch<Conversation>(`/conversations/${id}/status`, { status }),
  setAssignee: (id: string, userId: string | null) => http.patch<Conversation>(`/conversations/${id}/assignee`, { userId }),
  addNote: (id: string, text: string) => http.post<Conversation>(`/conversations/${id}/notes`, { text }),
  reply: (id: string, text: string) => http.post<Conversation>(`/conversations/${id}/replies`, { text }),
  sync: () => http.post<{ results: SyncOutcome[] }>("/conversations/sync"),
  members: () => http.get<WorkspaceMemberSummary[]>("/conversations/members", { noBrand: true }),
}
