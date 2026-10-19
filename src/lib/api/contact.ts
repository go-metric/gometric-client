import { api } from "@/lib/api/http"

export const contactApi = {
  submit(body: { name: string; email: string; message: string }) {
    return api<void>("/contact", {
      method: "POST",
      body: JSON.stringify(body),
    })
  },
}
