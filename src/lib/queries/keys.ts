import type { AnalyticsParams, ConversationFilters, PostListParams } from "@/lib/api/types"

/** Single source of truth for cache identities. Invalidate by prefix. */
export const queryKeys = {
  workspace: ["workspace"] as const,
  accounts: ["accounts"] as const,
  posts: {
    all: ["posts"] as const,
    list: (params: PostListParams) => ["posts", "list", params] as const,
    detail: (id: string) => ["posts", "detail", id] as const,
  },
  conversations: ["conversations"] as const,
  inbox: {
    all: ["conversations"] as const,
    list: (filters: ConversationFilters) => ["conversations", "list", filters] as const,
    preview: (filters: ConversationFilters) => ["conversations", "preview", filters] as const,
    detail: (id: string) => ["conversations", "detail", id] as const,
    members: ["conversations", "members"] as const,
  },
  notifications: ["notifications"] as const,
  analytics: {
    all: ["analytics"] as const,
    report: (params: AnalyticsParams) => ["analytics", "report", params] as const,
  },
  reports: ["reports"] as const,
  billing: ["billing"] as const,
}
