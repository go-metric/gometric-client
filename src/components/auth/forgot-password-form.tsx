"use client"

import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { FormField } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authApi } from "@/lib/api/auth"
import { errorMessage } from "@/lib/api/errors"

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim()
    setPending(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
      toast.success("If that email exists, we sent a reset link")
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setPending(false)
    }
  }

  if (sent) {
    return (
      <p className="mt-8 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
        Check your inbox for a reset link. In local development the service prints the link in its console log.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <FormField id="email" label="Email">
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@brand.com" required />
      </FormField>
      <Button type="submit" variant="ink" size="lg" className="w-full rounded-xl" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  )
}
