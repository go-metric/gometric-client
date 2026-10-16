"use client"

import { useRouter } from "next/navigation"
import type { ComponentProps } from "react"

type DemoFormProps = Omit<ComponentProps<"form">, "onSubmit" | "action"> & {
  /** Where to go on submit, so design previews can be clicked through. */
  next?: string
  /**
   * Form field names to forward as query params on `next` (e.g. signup email → verify page).
   * Dropped once real auth posts to the service.
   */
  carry?: string[]
}

/**
 * Form shell for design-only screens: it never posts anywhere.
 * Swap for a server action once the API is wired up.
 */
export function DemoForm({ next, carry, ...props }: DemoFormProps) {
  const router = useRouter()
  return (
    <form
      {...props}
      onSubmit={(event) => {
        event.preventDefault()
        if (!next) return
        if (!carry?.length) {
          router.push(next)
          return
        }
        const form = new FormData(event.currentTarget)
        const url = new URL(next, window.location.origin)
        for (const name of carry) {
          const value = String(form.get(name) ?? "").trim()
          if (value) url.searchParams.set(name, value)
        }
        router.push(`${url.pathname}${url.search}`)
      }}
    />
  )
}
