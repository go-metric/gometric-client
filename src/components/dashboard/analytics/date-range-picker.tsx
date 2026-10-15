"use client"

import { useState } from "react"
import Link from "next/link"
import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  format,
  isSameDay,
  parseISO,
  startOfDay,
  startOfMonth,
} from "date-fns"
import { CalendarDays, ChevronDown, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { routes } from "@/config/site"
import type { AnalyticsParams } from "@/lib/api/types"
import { cn } from "@/lib/utils"

/**
 * "Main period" picker, modelled on Metricool's: a list of presets next to a
 * dual-month calendar for custom ranges. Plans that keep limited history
 * (the free plan) can't pick anything older than that.
 */
export type RangePreset = "7d" | "30d" | "month" | "prev_month" | "3m" | "6m" | "12m" | "custom"

export type RangeState = {
  preset: RangePreset
  /** yyyy-MM-dd, used when `preset` is "custom". */
  from: string
  to: string
}

export const initialRange: RangeState = { preset: "30d", from: "", to: "" }

const iso = (d: Date) => format(d, "yyyy-MM-dd")

type Window = { from: Date; to: Date }

const presets: { id: Exclude<RangePreset, "custom">; label: string; short: string; window: (today: Date) => Window }[] = [
  { id: "7d", label: "Last 7 days", short: "last 7 days", window: (t) => ({ from: addDays(t, -6), to: t }) },
  { id: "30d", label: "Last 30 days", short: "last 30 days", window: (t) => ({ from: addDays(t, -29), to: t }) },
  { id: "month", label: "Current month", short: "this month", window: (t) => ({ from: startOfMonth(t), to: t }) },
  {
    id: "prev_month",
    label: "Previous month",
    short: "previous month",
    window: (t) => {
      const previous = addMonths(t, -1)
      return { from: startOfMonth(previous), to: endOfMonth(previous) }
    },
  },
  { id: "3m", label: "Last 3 months", short: "last 3 months", window: (t) => ({ from: addDays(t, -89), to: t }) },
  { id: "6m", label: "Last 6 months", short: "last 6 months", window: (t) => ({ from: addDays(t, -179), to: t }) },
  { id: "12m", label: "Last 12 months", short: "last 12 months", window: (t) => ({ from: addDays(t, -364), to: t }) },
]

function windowOf(state: RangeState, today: Date): Window {
  if (state.preset === "custom" && state.from && state.to) return { from: parseISO(state.from), to: parseISO(state.to) }
  const preset = presets.find((p) => p.id === state.preset) ?? presets[1]!
  return preset.window(today)
}

export function rangeParams(state: RangeState): AnalyticsParams {
  const today = startOfDay(new Date())
  const { from, to } = windowOf(state, today)
  const range = differenceInCalendarDays(to, from) + 1
  return isSameDay(to, today) ? { range } : { range, end: iso(to) }
}

export function rangeLabel(state: RangeState) {
  if (state.preset === "custom") {
    const { from, to } = windowOf(state, startOfDay(new Date()))
    return `${format(from, "MMM d")} – ${format(to, "MMM d, yyyy")}`
  }
  if (state.preset === "prev_month") return format(addMonths(new Date(), -1), "MMMM yyyy")
  return presets.find((p) => p.id === state.preset)?.short ?? "last 30 days"
}

/** Whether the selected window stays inside the plan's analytics history. */
export function fitsHistory(state: RangeState, historyDays: number) {
  const today = startOfDay(new Date())
  return differenceInCalendarDays(today, windowOf(state, today).from) + 1 <= historyDays
}

export function DateRangePicker({
  value,
  onChange,
  historyDays,
}: {
  value: RangeState
  onChange: (next: RangeState) => void
  /** How many days back the plan's analytics history reaches. */
  historyDays: number
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Window | undefined>()
  // First click of a custom range; the second click completes it.
  const [anchor, setAnchor] = useState<Date | null>(null)

  const today = startOfDay(new Date())
  const earliest = addDays(today, -(historyDays - 1))
  const current = windowOf(value, today)
  const activePreset = presets.find((p) => p.id === value.preset)
  const limited = presets.some((p) => differenceInCalendarDays(today, p.window(today).from) + 1 > historyDays)

  const choose = (id: Exclude<RangePreset, "custom">) => {
    onChange({ preset: id, from: "", to: "" })
    setOpen(false)
  }

  const pick = (day: Date) => {
    if (!anchor) {
      setAnchor(day)
      setDraft({ from: day, to: day })
      return
    }
    const [from, to] = day < anchor ? [day, anchor] : [anchor, day]
    setAnchor(null)
    onChange({ preset: "custom", from: iso(from), to: iso(to) })
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setAnchor(null)
          setDraft({ from: current.from, to: current.to })
        }
      }}
    >
      <PopoverTrigger
        render={<Button variant="outline" className="h-10 gap-2 rounded-xl px-3 font-normal" aria-label="Main period" />}
      >
        <CalendarDays className="size-4 text-muted-foreground" />
        <span className="font-medium">{activePreset?.label ?? "Custom range"}</span>
        <span className="hidden text-muted-foreground sm:inline">
          {format(current.from, "MMM d")} – {format(current.to, "MMM d, yyyy")}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden rounded-2xl p-0">
        <div className="flex flex-col-reverse sm:flex-row">
          <div className="max-w-full overflow-x-auto p-2 sm:p-3">
            <Calendar
              numberOfMonths={2}
              modifiers={
                draft
                  ? {
                      range_start: draft.from,
                      range_end: draft.to,
                      // With a single day picked, an "after … before …" matcher would invert.
                      range_middle: isSameDay(draft.from, draft.to) ? [] : { after: draft.from, before: draft.to },
                    }
                  : undefined
              }
              onDayClick={pick}
              defaultMonth={addMonths(startOfMonth(current.to), -1)}
              startMonth={startOfMonth(earliest)}
              endMonth={startOfMonth(today)}
              disabled={[{ before: earliest }, { after: today }]}
            />
          </div>
          <div className="flex shrink-0 flex-col gap-0.5 border-b border-border p-2 sm:w-48 sm:border-b-0 sm:border-l sm:p-3">
            <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">Main period</p>
            {presets.map((p) => {
              const locked = differenceInCalendarDays(today, p.window(today).from) + 1 > historyDays
              const selected = value.preset === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={locked}
                  onClick={() => choose(p.id)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                    selected ? "bg-foreground font-medium text-background" : "hover:bg-muted",
                    locked && "cursor-not-allowed text-muted-foreground opacity-60 hover:bg-transparent"
                  )}
                >
                  {p.label}
                  {locked ? <Lock className="size-3.5" aria-label="Needs a paid plan" /> : null}
                </button>
              )
            })}
            {limited ? (
              <p className="mt-2 border-t border-border px-2 pt-3 text-xs leading-relaxed text-muted-foreground">
                Your plan keeps {historyDays} days of history.{" "}
                <Link href={routes.dashboard.billing} className="font-medium text-foreground underline underline-offset-2">
                  Upgrade
                </Link>{" "}
                to look further back.
              </p>
            ) : null}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
