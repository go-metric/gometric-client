import { http } from "@/lib/api/http"
import type { Post, PostInput, PostListParams } from "@/lib/api/types"
import { validatePost } from "@/lib/posts"
import { ApiError } from "@/lib/api/errors"

function assertValid(input: PostInput) {
  const [problem] = validatePost(input)
  if (problem) throw new ApiError(problem, 422)
}

/** Strips client-only fields; the service accepts media as `{ id, name?, url? }`. */
function toBody(input: Partial<PostInput>) {
  return input
}

export const postsApi = {
  list: (params: PostListParams = {}) =>
    http.get<Post[]>("/posts", { query: { from: params.from, to: params.to, status: params.status } }),
  get: (id: string) => http.get<Post>(`/posts/${id}`),
  async create(input: PostInput) {
    assertValid(input)
    return http.post<Post>("/posts", toBody(input))
  },
  update: (id: string, patch: Partial<PostInput>) => http.patch<Post>(`/posts/${id}`, toBody(patch)),
  reschedule: (id: string, scheduledAt: string) => http.post<Post>(`/posts/${id}/reschedule`, { scheduledAt }),
  publishNow: (id: string) => http.post<Post>(`/posts/${id}/publish`),
  duplicate: (id: string) => http.post<Post>(`/posts/${id}/duplicate`),
  remove: (id: string) => http.delete<void>(`/posts/${id}`),
}
