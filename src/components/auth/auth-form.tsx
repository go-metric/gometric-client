"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState, type ComponentProps } from "react"
import { toast } from "sonner"
import { ApiError, errorMessage } from "@/lib/api/errors"
import { authApi } from "@/lib/api/auth"
import { routes } from "@/config/site"

export type AuthFormKind = "login" | "signup" | "forgot" | "reset" | "contact"

const value = (form: FormData, name: string) => String(form.get(name) ?? "").trim()

/** Only same-site paths are allowed as post-login destinations. */
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null
}

/**
 * Form shell for the public/auth screens. Posts to the service, shows the
 * service's error message inline, and routes on success.
 */
function AuthFormInner({ kind, ...props }: { kind: AuthFormKind } & Omit<ComponentProps<"form">, "onSubmit" | "action">) {
  const router = useRouter()
  const params = useSearchParams()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(form: HTMLFormElement) {
    const data = new FormData(form)
    switch (kind) {
      case "login": {
        await authApi.login({ email: value(data, "email"), password: String(data.get("password") ?? "") })
        router.push(safeNext(params.get("next")) ?? routes.dashboard.overview)
        break
      }
      case "signup": {
        const email = value(data, "email")
        await authApi.signup({ name: value(data, "name"), email, password: String(data.get("password") ?? "") })
        router.push(`${routes.verifyEmail}?email=${encodeURIComponent(email)}`)
        break
      }
      case "forgot": {
        await authApi.forgotPassword(value(data, "email"))
        toast.success("If that email has an account, a reset link is on its way.")
        form.reset()
        break
      }
      case "reset": {
        const token = params.get("token")
        if (!token) throw new ApiError("This reset link is missing its token. Request a new one.", 400)
        const password = String(data.get("password") ?? "")
        if (password !== String(data.get("confirm") ?? "")) throw new ApiError("Passwords don't match.", 422)
        await authApi.resetPassword({ token, password })
        toast.success("Password updated. Log in with your new password.")
        router.push(routes.login)
        break
      }
      case "contact": {
        const topic = value(data, "topic")
        await authApi.contact({
          name: value(data, "name"),
          email: value(data, "email"),
          message: topic ? `[${topic}] ${value(data, "message")}` : value(data, "message"),
        })
        toast.success("Message sent. We'll reply by email.")
        form.reset()
        break
      }
    }
  }

  return (
    <form
      {...props}
      onSubmit={async (event) => {
        event.preventDefault()
        if (pending) return
        const form = event.currentTarget
        setPending(true)
        setError(null)
        try {
          await run(form)
        } catch (e) {
          setError(errorMessage(e))
        } finally {
          setPending(false)
        }
      }}
    >
      <fieldset className="contents" disabled={pending}>
        {props.children}
      </fieldset>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  )
}

export function AuthForm(props: { kind: AuthFormKind } & Omit<ComponentProps<"form">, "onSubmit" | "action">) {
  return (
    <Suspense fallback={null}>
      <AuthFormInner {...props} />
    </Suspense>
  )
}
