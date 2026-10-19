"use client"

import { useEffect, useState, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ListSkeleton } from "@/components/dashboard/ui"
import { routes } from "@/config/site"
import { loadAuthSession } from "@/lib/auth-session"
import { setAccessToken, setActiveBrandId } from "@/lib/api/http"

type Mode = "dashboard" | "onboarding"

/**
 * Client-side gate: valid session via cookie and/or Bearer (`/auth/me`).
 * Dashboard users with no brands are sent to onboarding.
 */
export function RequireAuth({ children, mode }: { children: ReactNode; mode: Mode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const me = await loadAuthSession()
      if (cancelled) return

      if (!me) {
        setAccessToken(null)
        setActiveBrandId(null)
        const next = encodeURIComponent(pathname || "/")
        router.replace(`${routes.login}?next=${next}`)
        return
      }

      if (mode === "dashboard" && me.workspace.brandCount === 0) {
        router.replace(routes.onboarding.brand)
        return
      }

      setReady(true)
    })()

    return () => {
      cancelled = true
    }
  }, [mode, pathname, router])

  if (!ready) {
    return (
      <div className="flex min-h-svh flex-1 items-center justify-center p-6">
        <ListSkeleton rows={4} className="w-full max-w-md" />
      </div>
    )
  }

  return <>{children}</>
}
