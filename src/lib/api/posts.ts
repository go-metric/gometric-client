import { api, toQuery } from "@/lib/api/http"
import type { Post, PostInput, PostListParams } from "@/lib/api/types"

export const postsApi = {
  list(params: PostListParams = {}) {
    return api<Post[]>(`/posts${toQuery(params)}`)
  },

  get(id: string) {
    return api<Post>(`/posts/${id}`)
  },

  create(input: PostInput) {
    return api<Post>("/posts", { method: "POST", body: JSON.stringify(input) })
  },

  update(id: string, patch: Partial<PostInput>) {
    return api<Post>(`/posts/${id}`, { method: "PATCH", body: JSON.stringify(patch) })
  },

  reschedule(id: string, scheduledAt: string) {
    return api<Post>(`/posts/${id}/reschedule`, {
      method: "POST",
      body: JSON.stringify({ scheduledAt }),
    })
  },

  publishNow(id: string) {
    return api<Post>(`/posts/${id}/publish`, { method: "POST" })
  },

  duplicate(id: string) {
    return api<Post>(`/posts/${id}/duplicate`, { method: "POST" })
  },

  remove(id: string) {
    return api<void>(`/posts/${id}`, { method: "DELETE" })
  },
}
