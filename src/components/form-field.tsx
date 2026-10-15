import type { ReactNode } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/** Label + control + optional hint, stacked. */
export function FormField({
  id,
  label,
  hint,
  action,
  className,
  children,
}: {
  id: string
  label: ReactNode
  hint?: ReactNode
  /** Rendered at the end of the label row, e.g. a "Forgot password?" link. */
  action?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {action}
      </div>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

/** Native select styled like `Input`. */
export const selectClassName =
  "h-10 w-full appearance-none rounded-xl border border-input bg-card bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%23888' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")] bg-[position:right_0.75rem_center] bg-no-repeat pr-9 pl-3.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
