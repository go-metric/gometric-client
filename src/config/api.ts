/**
 * Backend API hosts. Flip `useLocal` to true when running gometric-service locally.
 */
const useLocal = false

export const apiUrls = {
  /** Hosted development API. */
  development: "https://api.gometric.social",
  /** Local Nest service (`pnpm dev` in gometric-service). */
  local: "http://localhost:4000",
} as const

/** Active base URL for all client HTTP calls (no trailing slash). */
export const apiBaseUrl = (useLocal ? apiUrls.local : apiUrls.development).replace(/\/$/, "")
