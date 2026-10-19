import { ApiError } from "@/lib/api/errors"

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "")

type Query = Record<string, string | number | boolean | undefined | null>

export type RequestOptions = {
  query?: Query
  body?: unknown
  /** Workspace-scoped route (no active-brand scoping). Brand scope comes from the server-side active brand. */
  noBrand?: boolean
  /** Do not redirect to login on 401 (auth pages). */
  allow401?: boolean
}

function buildUrl(path: string, query?: Query) {
  const url = new URL(`${BASE_URL}${path}`)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value))
  }
  return url.toString()
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData
  if (options.body !== undefined && !isForm) headers["Content-Type"] = "application/json"

  let response: Response
  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      headers,
      credentials: "include",
      body:
        options.body === undefined ? undefined : isForm ? (options.body as FormData) : JSON.stringify(options.body),
    })
  } catch {
    throw new ApiError("Can't reach the gometric service. Check your connection and try again.", 0)
  }

  if (response.status === 204) return undefined as T
  const text = await response.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }
  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data && typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : `Request failed (${response.status}).`
    if (response.status === 401 && !options.allow401 && typeof window !== "undefined") {
      const here = window.location.pathname
      if (here.startsWith("/dashboard") || here.startsWith("/onboarding")) {
        window.location.href = `/login?next=${encodeURIComponent(here)}`
      }
    }
    throw new ApiError(message, response.status)
  }
  return data as T
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("POST", path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("PUT", path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("PATCH", path, { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>("DELETE", path, options),
}
