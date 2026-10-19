import { routes } from "@/config/site"
import { api, setActiveBrandId } from "@/lib/api/http"
import {
  getAuthSessionPromise,
  setAuthSessionPromise,
} from "@/lib/session-cache"

export type AuthSession = {
  userId: string
  profile: { name: string; email: string }
  workspace: {
    id: string
    activeBrandId: string
    brandCount: number
  }
}

export { invalidateAuthSession } from "@/lib/session-cache"

/**
 * Resolves the current user via cookie and/or Bearer token.
 * Caches the result so header + CTAs only hit `/auth/me` once per page load.
 */
export function loadAuthSession(): Promise<AuthSession | null> {
  const existing = getAuthSessionPromise<AuthSession | null>()
  if (existing) return existing

  return setAuthSessionPromise(
    api<AuthSession>("/auth/me", { skipAuthRedirect: true })
      .then((me) => {
        setActiveBrandId(me.workspace.activeBrandId || null)
        return me
      })
      .catch(() => null),
  )
}

/** Dashboard vs onboarding based on whether the workspace has brands. */
export function appHomeFor(me: AuthSession) {
  return me.workspace.brandCount > 0 ? routes.dashboard.overview : routes.onboarding.brand
}
