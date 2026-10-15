"use client"

import { useRouter } from "next/navigation"
import type { ComponentProps } from "react"

type DemoFormProps = Omit<ComponentProps<"form">, "onSubmit" | "action"> & {
  /** Where to go on submit, so design previews can be clicked through. */
  next?: string
}

/**
 * Form shell for design-only screens: it never posts anywhere.
 * Swap for a server action once the API is wired up.
 */
export function DemoForm({ next, ...props }: DemoFormProps) {
  const router = useRouter()
  return (
    <form
      {...props}
      onSubmit={(event) => {
        event.preventDefault()
        if (next) router.push(next)
      }}
    />
  )
}
