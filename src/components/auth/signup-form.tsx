"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { FormField } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { routes } from "@/config/site"
import { authApi } from "@/lib/api/auth"
import { errorMessage } from "@/lib/api/errors"

export function SignupForm() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = String(form.get("name") ?? "").trim()
    const email = String(form.get("email") ?? "").trim()
    const password = String(form.get("password") ?? "")
    setPending(true)
    try {
      await authApi.signup({ name, email, password })
      toast.success("Check your email to verify your account")
      router.push(`${routes.verifyEmail}?email=${encodeURIComponent(email)}`)
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <FormField id="name" label="Full name">
        <Input id="name" name="name" autoComplete="name" placeholder="Emily Carter" required />
      </FormField>
      <FormField id="email" label="Work email">
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@brand.com" required />
      </FormField>
      <FormField id="password" label="Password" hint="At least 8 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </FormField>
      <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
        <Checkbox name="terms" className="mt-0.5" required />
        <span>
          I agree to the{" "}
          <Link href="/terms" className="font-medium text-foreground underline underline-offset-2">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium text-foreground underline underline-offset-2">
            Privacy policy
          </Link>
          .
        </span>
      </label>
      <Button type="submit" variant="ink" size="lg" className="w-full rounded-xl" disabled={pending}>
        {pending ? "Creating…" : "Create account"}
      </Button>
    </form>
  )
}
