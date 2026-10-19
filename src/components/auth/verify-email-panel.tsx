"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button, ButtonLink } from "@/components/ui/button"
import { routes } from "@/config/site"
import { authApi } from "@/lib/api/auth"
import { errorMessage } from "@/lib/api/errors"

export function VerifyEmailPanel({ fallbackEmail }: { fallbackEmail: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get("token")
  const email = params.get("email")?.trim() || fallbackEmail
  const [verifying, setVerifying] = useState(!!token)
  const [verified, setVerified] = useState(false)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    ;(async () => {
      try {
        await authApi.verifyEmail(token)
        if (!cancelled) {
          setVerified(true)
          toast.success("Email verified — you can log in")
        }
      } catch (error) {
        if (!cancelled) toast.error(errorMessage(error))
      } finally {
        if (!cancelled) setVerifying(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  const resend = async () => {
    setResending(true)
    try {
      await authApi.resendVerification(email)
      toast.success("Verification email sent")
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setResending(false)
    }
  }

  if (verifying) {
    return <p className="mt-8 text-sm text-muted-foreground">Verifying your email…</p>
  }

  if (verified) {
    return (
      <div className="mt-8 space-y-3">
        <ButtonLink variant="ink" size="lg" className="w-full rounded-xl" href={routes.login}>
          Continue to log in
        </ButtonLink>
      </div>
    )
  }

  return (
    <div className="mt-8 space-y-3">
      <Button
        variant="ink"
        size="lg"
        className="w-full rounded-xl"
        onClick={() => router.push(routes.login)}
      >
        I&apos;ve verified. Continue
      </Button>
      <Button variant="outline" size="lg" className="w-full rounded-xl" disabled={resending} onClick={resend}>
        {resending ? "Sending…" : "Resend email"}
      </Button>
    </div>
  )
}
