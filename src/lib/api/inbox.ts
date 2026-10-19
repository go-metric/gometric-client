import { api, toQuery } from "@/lib/api/http"
import type {
  Conversation,
  ConversationFilters,
  ConversationPage,
  ConversationStatus,
  SyncOutcome,
  WorkspaceMemberSummary,
} from "@/lib/api/types"

const json = (method: string, body: unknown) => ({ method, body: JSON.stringify(body) })

export const inboxApi = {
  list: (filters: ConversationFilters = {}) => api<ConversationPage>(`/conversations${toQuery({ ...filters, unread: filters.unread === undefined ? undefined : String(filters.unread) })}`),
  get: (id: string) => api<Conversation>(`/conversations/${id}`),
  setUnread: (id: string, unread: boolean) => api<Conversation>(`/conversations/${id}/unread`, json("PATCH", { unread })),
  setStatus: (id: string, status: ConversationStatus) => api<Conversation>(`/conversations/${id}/status`, json("PATCH", { status })),
  setAssignee: (id: string, userId: string | null) => api<Conversation>(`/conversations/${id}/assignee`, json("PATCH", { userId })),
  addNote: (id: string, text: string) => api<Conversation>(`/conversations/${id}/notes`, json("POST", { text })),
  reply: (id: string, text: string) => api<Conversation>(`/conversations/${id}/replies`, json("POST", { text })),
  sync: () => api<{ results: SyncOutcome[] }>("/conversations/sync", { method: "POST" }),
  members: () => api<WorkspaceMemberSummary[]>("/conversations/members"),
}
