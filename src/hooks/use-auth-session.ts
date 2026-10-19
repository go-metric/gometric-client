"use client"

import { useEffect, useState } from "react"
import { routes } from "@/config/site"
import { appHomeFor, loadAuthSession, type AuthSession } from "@/lib/auth-session"
import { hasAccessToken } from "@/lib/api/http"

export type AuthSessionStatus = "loading" | "authenticated" | "anonymous"

/**
 * Client auth probe for marketing chrome and guest CTAs.
 * Prefer cookie+Bearer `/auth/me`; optimistically treat a stored token as signed-in
 * so Log in / Sign up don't flash while the request is in flight.
 */
export function useAuthSession() {
  const [me, setMe] = useState<AuthSession | null>(null)
  const [status, setStatus] = useState<AuthSessionStatus>(() =>
    typeof window !== "undefined" && hasAccessToken() ? "authenticated" : "loading",
  )
  const [appHref, setAppHref] = useState<string>(routes.dashboard.overview)

  useEffect(() => {
    let cancelled = false

    void loadAuthSession().then((session) => {
      if (cancelled) return
      if (session) {
        setMe(session)
        setAppHref(appHomeFor(session))
        setStatus("authenticated")
      } else {
        setMe(null)
        setStatus("anonymous")
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  return {
    status,
    me,
    appHref,
    isAuthenticated: status === "authenticated",
  }
}
