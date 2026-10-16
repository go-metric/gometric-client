"use client"

import { useEffect, useState, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ListSkeleton } from "@/components/dashboard/ui"
import { routes } from "@/config/site"
import { authApi } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/errors"
import { getAccessToken, setAccessToken, setActiveBrandId } from "@/lib/api/http"

type Mode = "dashboard" | "onboarding"

/**
 * Client-side gate: requires a Bearer token and a valid `/auth/me`.
 * Dashboard users with no brands are sent to onboarding.
 */
export function RequireAuth({ children, mode }: { children: ReactNode; mode: Mode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      if (!getAccessToken()) {
        const next = encodeURIComponent(pathname || "/")
        router.replace(`${routes.login}?next=${next}`)
        return
      }

      try {
        const me = await authApi.me({ skipAuthRedirect: true })
        if (cancelled) return

        setActiveBrandId(me.workspace.activeBrandId || null)

        if (mode === "dashboard" && me.workspace.brandCount === 0) {
          router.replace(routes.onboarding.brand)
          return
        }

        setReady(true)
      } catch (error) {
        if (cancelled) return
        setAccessToken(null)
        setActiveBrandId(null)
        const next = encodeURIComponent(pathname || "/")
        if (error instanceof ApiError && error.status === 401) {
          router.replace(`${routes.login}?next=${next}`)
        } else {
          router.replace(routes.login)
        }
      }
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
