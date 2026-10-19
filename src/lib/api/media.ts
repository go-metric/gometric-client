import { api } from "@/lib/api/http"
import type { PostMedia } from "@/lib/api/types"

export const mediaApi = {
  async upload(file: File): Promise<PostMedia> {
    const body = new FormData()
    body.append("file", file)
    return api<PostMedia>("/media/upload", {
      method: "POST",
      body,
      rawBody: true,
    })
  },
}
