"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button, ButtonLink } from "@/components/ui/button"
import { routes } from "@/config/site"
import { authApi } from "@/lib/api/auth"
import { errorMessage } from "@/lib/api/errors"

function Panel() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get("token")
  const email = params.get("email")?.trim() ?? ""
  const [state, setState] = useState<"idle" | "verifying" | "verified" | "failed">(token ? "verifying" : "idle")
  const [message, setMessage] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (!token || started.current) return
    started.current = true
    authApi
      .verifyEmail(token)
      .then(() => {
        setState("verified")
        toast.success("Email verified. Log in to continue.")
        router.replace(routes.login)
      })
      .catch((e) => {
        setState("failed")
        setMessage(errorMessage(e))
      })
  }, [token, router])

  return (
    <div className="mt-8 space-y-3">
      {state === "verifying" ? <p className="text-sm text-muted-foreground">Verifying your email…</p> : null}
      {state === "failed" ? (
        <p role="alert" className="text-sm text-destructive">
          {message ?? "This verification link is invalid or has expired."}
        </p>
      ) : null}
      <ButtonLink variant="ink" size="lg" className="w-full rounded-xl" href={routes.login}>
        {state === "verified" ? "Continue to log in" : "I've verified. Log in"}
      </ButtonLink>
      <Button
        variant="outline"
        size="lg"
        className="w-full rounded-xl"
        disabled={resending}
        onClick={async () => {
          setResending(true)
          try {
            await authApi.resendVerification(email || undefined)
            toast.success("Verification email sent.")
          } catch (e) {
            toast.error(errorMessage(e))
          } finally {
            setResending(false)
          }
        }}
      >
        {resending ? "Sending…" : "Resend email"}
      </Button>
    </div>
  )
}

export function VerifyEmailDescription() {
  return (
    <Suspense fallback="Click the verification link we emailed you to activate your account.">
      <Description />
    </Suspense>
  )
}

function Description() {
  const email = useSearchParams().get("email")?.trim()
  return email ? (
    <>
      We sent a verification link to <strong className="font-semibold text-foreground">{email}</strong>. Click it to
      activate your account.
    </>
  ) : (
    "Click the verification link we emailed you to activate your account."
  )
}

export function VerifyEmailPanel() {
  return (
    <Suspense fallback={null}>
      <Panel />
    </Suspense>
  )
}
