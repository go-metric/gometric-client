import type { NetworkId } from "@/config/networks"
import { api, toQuery } from "@/lib/api/http"
import type { PinterestBoard, Post, PostInput, PostListParams, PublishLogEntry } from "@/lib/api/types"

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

  /** Resends failed networks only; networks that already published are untouched. */
  retry(id: string, networks?: NetworkId[]) {
    return api<Post>(`/posts/${id}/retry`, { method: "POST", body: JSON.stringify({ networks }) })
  },

  logs(id: string) {
    return api<PublishLogEntry[]>(`/posts/${id}/logs`)
  },

  duplicate(id: string) {
    return api<Post>(`/posts/${id}/duplicate`, { method: "POST" })
  },

  /** Deletes the record; with `platform`, also deletes it from networks whose API allows that. */
  remove(id: string, options: { platform?: boolean } = {}) {
    return api<void>(`/posts/${id}${options.platform ? "?platform=true" : ""}`, { method: "DELETE" })
  },

  removeFromNetwork(id: string, network: NetworkId) {
    return api<Post>(`/posts/${id}/deliveries/${network}`, { method: "DELETE" })
  },

  pinterestBoards() {
    return api<PinterestBoard[]>("/posts/options/pinterest-boards")
  },
}
