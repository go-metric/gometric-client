"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { FormField } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { routes } from "@/config/site"
import { authApi } from "@/lib/api/auth"
import { ApiError, errorMessage } from "@/lib/api/errors"

function safeNextPath(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null
  return raw
}

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [pending, setPending] = useState(false)
  const [remember, setRemember] = useState(true)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get("email") ?? "").trim()
    const password = String(form.get("password") ?? "")
    setPending(true)
    try {
      await authApi.login({ email, password, remember })
      const me = await authApi.me({ skipAuthRedirect: true })
      toast.success("Welcome back")
      const next = safeNextPath(params.get("next"))
      if (next) {
        router.push(next)
      } else {
        router.push(me.workspace.brandCount > 0 ? routes.dashboard.overview : routes.onboarding.brand)
      }
    } catch (error) {
      toast.error(errorMessage(error))
      if (error instanceof ApiError && error.status === 403) {
        router.push(`${routes.verifyEmail}?email=${encodeURIComponent(email)}`)
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <FormField id="email" label="Email">
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@brand.com" required />
      </FormField>
      <FormField
        id="password"
        label="Password"
        action={
          <Link href={routes.forgotPassword} className="text-xs font-medium text-brand hover:underline">
            Forgot password?
          </Link>
        }
      >
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </FormField>
      <label className="flex items-center gap-2.5 text-sm">
        <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
        Keep me logged in
      </label>
      <Button type="submit" variant="ink" size="lg" className="w-full rounded-xl" disabled={pending}>
        {pending ? "Signing in…" : "Log in"}
      </Button>
    </form>
  )
}
