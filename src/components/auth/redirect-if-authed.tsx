"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ListSkeleton } from "@/components/dashboard/ui"
import { routes } from "@/config/site"
import { authApi } from "@/lib/api/auth"
import { getAccessToken, setAccessToken, setActiveBrandId } from "@/lib/api/http"

/** Sends already-signed-in users away from login/signup to the app. */
export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      if (!getAccessToken()) {
        if (!cancelled) setReady(true)
        return
      }

      try {
        const me = await authApi.me({ skipAuthRedirect: true })
        if (cancelled) return
        setActiveBrandId(me.workspace.activeBrandId || null)
        router.replace(me.workspace.brandCount > 0 ? routes.dashboard.overview : routes.onboarding.brand)
      } catch {
        if (cancelled) return
        setAccessToken(null)
        setActiveBrandId(null)
        setReady(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [router])

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <ListSkeleton rows={3} className="w-full" />
      </div>
    )
  }

  return <>{children}</>
}
