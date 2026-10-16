"use client"

import { Lock } from "lucide-react"
import { ButtonLink } from "@/components/ui/button"
import { routes } from "@/config/site"
import { useActiveBrand } from "@/lib/queries/workspace"

/** Shown above every dashboard page while the active brand is locked by the plan. */
export function LockedBrandBanner() {
  const { data: brand } = useActiveBrand()
  if (!brand?.locked) return null

  return (
    <div
      role="status"
      className="mb-6 flex flex-col gap-3 rounded-2xl bg-amber-500/12 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between dark:text-amber-100"
    >
      <p className="flex items-start gap-2.5">
        <Lock className="mt-0.5 size-4 shrink-0" />
        <span>
          <span className="font-semibold">{brand.name}</span> is locked on your current plan. You can view its posts,
          inbox and analytics, but can&apos;t edit or publish until you upgrade.
        </span>
      </p>
      <ButtonLink href={routes.dashboard.billing} size="sm" variant="ink" className="shrink-0">
        Upgrade to unlock
      </ButtonLink>
    </div>
  )
}
