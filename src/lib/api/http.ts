import { apiBaseUrl as configuredApiBaseUrl } from "@/config/api"
import { ApiError } from "@/lib/api/errors"
import { routes } from "@/config/site"

const TOKEN_KEY = "gometric:accessToken"
const REMEMBER_KEY = "gometric:remember"

let activeBrandId: string | null = null
let handlingUnauthorized = false

/** Active API origin from `src/config/api.ts`. */
export function apiBaseUrl() {
  return configuredApiBaseUrl
}

export function isRemoteApi() {
  return apiBaseUrl().length > 0
}

export function hasAccessToken() {
  return !!getAccessToken()
}

export function getAccessToken() {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_KEY) ?? window.sessionStorage.getItem(TOKEN_KEY)
}

/**
 * Store the access token.
 * `remember: true` → localStorage (survives tab close).
 * `remember: false` → sessionStorage (cleared when the tab closes).
 * Omitting `remember` keeps the previous preference (defaults to session).
 */
export function setAccessToken(token: string | null, options?: { remember?: boolean }) {
  if (typeof window === "undefined") return

  window.localStorage.removeItem(TOKEN_KEY)
  window.sessionStorage.removeItem(TOKEN_KEY)

  if (!token) {
    window.localStorage.removeItem(REMEMBER_KEY)
    return
  }

  if (options?.remember !== undefined) {
    if (options.remember) window.localStorage.setItem(REMEMBER_KEY, "1")
    else window.localStorage.removeItem(REMEMBER_KEY)
  }

  const remember =
    options?.remember ?? window.localStorage.getItem(REMEMBER_KEY) === "1"
  const store = remember ? window.localStorage : window.sessionStorage
  store.setItem(TOKEN_KEY, token)
}

/** Sent as `X-Active-Brand-Id` so brand-scoped routes match the UI switcher. */
export function setActiveBrandId(brandId: string | null) {
  activeBrandId = brandId && brandId.length > 0 ? brandId : null
}

export function getActiveBrandId() {
  return activeBrandId
}

/** Clear credentials and send the user to login (once). */
export function handleUnauthorized(message = "Your session expired. Please log in again.") {
  if (typeof window === "undefined" || handlingUnauthorized) return
  const path = window.location.pathname
  if (path === routes.login || path.startsWith(`${routes.login}/`)) {
    setAccessToken(null)
    setActiveBrandId(null)
    return
  }

  handlingUnauthorized = true
  setAccessToken(null)
  setActiveBrandId(null)

  void import("sonner").then(({ toast }) => toast.error(message))

  const next = `${window.location.pathname}${window.location.search}`
  const url = next && next !== "/" ? `${routes.login}?next=${encodeURIComponent(next)}` : routes.login
  window.location.assign(url)
}

type ApiInit = RequestInit & {
  /** Skip JSON Content-Type (e.g. FormData uploads). */
  rawBody?: boolean
  /** Skip the global 401 redirect (e.g. login/me probes). */
  skipAuthRedirect?: boolean
}

/**
 * Fetch helper for gometric-service.
 * Uses cookie session (`credentials: "include"`) and optional Bearer token.
 */
export async function api<T>(path: string, init: ApiInit = {}): Promise<T> {
  const base = apiBaseUrl()
  if (!base) {
    throw new ApiError("API base URL is not configured. Check src/config/api.ts.", 500)
  }

  const { rawBody, skipAuthRedirect, headers: initHeaders, ...rest } = init
  const headers = new Headers(initHeaders)

  if (!rawBody && rest.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const token = getAccessToken()
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const brandId = getActiveBrandId()
  if (brandId && !headers.has("X-Active-Brand-Id")) {
    headers.set("X-Active-Brand-Id", brandId)
  }

  const res = await fetch(`${base}${path}`, {
    ...rest,
    credentials: "include",
    headers,
  })

  if (res.status === 204) return undefined as T

  const data = (await res.json().catch(() => ({}))) as { message?: string }

  if (!res.ok) {
    if (res.status === 401 && !skipAuthRedirect) {
      handleUnauthorized()
    } else if (res.status === 401) {
      setAccessToken(null)
      setActiveBrandId(null)
    }
    throw new ApiError(data.message ?? "Request failed.", res.status)
  }

  return data as T
}

export function toQuery(params: Record<string, string | number | undefined | null>) {
  const q = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue
    q.set(key, String(value))
  }
  const s = q.toString()
  return s ? `?${s}` : ""
}
