import type { AnalyticsParams, NetworkAnalyticsParams, PostListParams } from "@/lib/api/types"

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
  notifications: ["notifications"] as const,
  analytics: {
    all: ["analytics"] as const,
    summary: (params: AnalyticsParams) => ["analytics", "summary", params] as const,
    network: (params: NetworkAnalyticsParams) => ["analytics", "network", params] as const,
  },
  billing: ["billing"] as const,
}
