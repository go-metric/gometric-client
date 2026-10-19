"use client"

import { useState, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { FormField } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { routes } from "@/config/site"
import { authApi } from "@/lib/api/auth"
import { errorMessage } from "@/lib/api/errors"

export function ResetPasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get("token") ?? ""
  const [pending, setPending] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!token) {
      toast.error("This reset link is missing a token. Request a new one.")
      return
    }
    const form = new FormData(e.currentTarget)
    const password = String(form.get("password") ?? "")
    const confirm = String(form.get("confirm") ?? "")
    if (password !== confirm) {
      toast.error("Passwords do not match.")
      return
    }
    setPending(true)
    try {
      await authApi.resetPassword(token, password)
      toast.success("Password updated")
      router.push(routes.login)
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <FormField id="password" label="New password">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </FormField>
      <FormField id="confirm" label="Confirm password">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required />
      </FormField>
      <Button type="submit" variant="ink" size="lg" className="w-full rounded-xl" disabled={pending || !token}>
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  )
}
