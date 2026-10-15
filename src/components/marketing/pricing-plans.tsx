"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { ButtonLink } from "@/components/ui/button"
import { plans, type BillingCycle } from "@/config/pricing"
import { routes } from "@/config/site"
import { cn } from "@/lib/utils"

const cycles: { id: BillingCycle; label: string }[] = [
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
]

export function PricingPlans() {
  const [cycle, setCycle] = useState<BillingCycle>("yearly")

  return (
    <div>
      <div className="flex justify-center">
        <div role="radiogroup" aria-label="Billing cycle" className="inline-flex rounded-full bg-muted p-1">
          {cycles.map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={cycle === c.id}
              onClick={() => setCycle(c.id)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-foreground/65 transition-all aria-checked:bg-card aria-checked:text-foreground aria-checked:shadow-sm"
            >
              {c.label}
              {c.id === "yearly" ? (
                <span className="rounded-full bg-highlight px-2 py-0.5 text-[11px] font-semibold text-[#1f1512]">
                  −40%
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-10 grid gap-4 lg:grid-cols-3 lg:gap-6">
        {plans.map((plan) => {
          const amount = plan.price[cycle]
          const paid = amount > 0
          return (
            <li
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-[2rem] border p-6 sm:p-8",
                plan.featured
                  ? "border-transparent bg-ink text-ink-foreground shadow-xl shadow-ink/20"
                  : "border-border bg-card"
              )}
            >
              {plan.featured ? (
                <span className="absolute top-6 right-6 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-foreground">
                  Most popular
                </span>
              ) : null}
              <h3 className="text-2xl font-semibold">{plan.name}</h3>
              <p className={cn("mt-2 text-sm", plan.featured ? "text-ink-foreground/70" : "text-muted-foreground")}>
                {plan.tagline}
              </p>
              <p className="mt-8 flex flex-wrap items-baseline gap-1.5">
                <span className="text-5xl font-medium tracking-tight">${amount}</span>
                <span className={cn("text-sm", plan.featured ? "text-ink-foreground/60" : "text-muted-foreground")}>
                  / month{paid && cycle === "yearly" ? ", billed yearly" : ""}
                </span>
              </p>
              <ButtonLink
                size="lg"
                variant={plan.featured ? "default" : "ink"}
                className={cn("mt-8 w-full rounded-2xl", plan.featured && "bg-brand text-brand-foreground hover:bg-brand/90")}
                href={routes.signup}
              >
                {plan.cta}
              </ButtonLink>
              <ul className="mt-8 space-y-3 border-t border-current/10 pt-8 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
