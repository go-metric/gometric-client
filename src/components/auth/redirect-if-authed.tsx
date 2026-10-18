"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ListSkeleton } from "@/components/dashboard/ui"
import { appHomeFor, loadAuthSession } from "@/lib/auth-session"
import { setAccessToken, setActiveBrandId } from "@/lib/api/http"

/** Sends already-signed-in users away from login/signup to the app. */
export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const me = await loadAuthSession()
      if (cancelled) return

      if (me) {
        router.replace(appHomeFor(me))
        return
      }

      setAccessToken(null)
      setActiveBrandId(null)
      setReady(true)
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
