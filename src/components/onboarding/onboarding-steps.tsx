"use client"

import { usePathname } from "next/navigation"
import { Check } from "lucide-react"
import { routes } from "@/config/site"
import { cn } from "@/lib/utils"

const steps = [
  { href: routes.onboarding.brand, label: "Create brand" },
  { href: routes.onboarding.connect, label: "Connect accounts" },
  { href: routes.onboarding.ready, label: "Ready" },
]

export function OnboardingSteps() {
  const pathname = usePathname()
  const current = Math.max(0, steps.findIndex((s) => s.href === pathname))

  return (
    <ol aria-label="Onboarding progress" className="flex items-center gap-2 sm:gap-3">
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={step.href} aria-current={active ? "step" : undefined} className="flex items-center gap-2 sm:gap-3">
            <span
              className={cn(
                "inline-flex size-7 items-center justify-center rounded-full border text-xs font-semibold",
                done && "border-transparent bg-ink text-ink-foreground",
                active && "border-transparent bg-brand text-brand-foreground",
                !done && !active && "border-border text-muted-foreground"
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn("hidden text-sm font-medium md:inline", !active && "text-muted-foreground")}>
              {step.label}
            </span>
            {i < steps.length - 1 ? <span className="h-px w-5 bg-border sm:w-10" /> : null}
          </li>
        )
      })}
    </ol>
  )
}
