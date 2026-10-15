"use client"

import { useState } from "react"
import { format, parse, startOfDay } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import type { Matcher } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type DatePickerProps = {
  id?: string
  "aria-label"?: string
  /** date-fns format for the trigger label. */
  displayFormat?: string
  value: string
  onChange: (value: string) => void
  /** Inclusive minimum date (`Date` or `yyyy-MM-dd`). */
  min?: Date | string
  /** Inclusive maximum date (`Date` or `yyyy-MM-dd`). */
  max?: Date | string
  placeholder?: string
  disabled?: boolean
  className?: string
}

function toDate(value: string | Date | undefined): Date | undefined {
  if (!value) return undefined
  if (value instanceof Date) return value
  return parse(value, "yyyy-MM-dd", new Date())
}

/** Popover calendar that stores values as `yyyy-MM-dd`. */
export function DatePicker({
  id,
  "aria-label": ariaLabel,
  displayFormat = "EEE, MMM d, yyyy",
  value,
  onChange,
  min,
  max,
  placeholder = "Pick a date",
  disabled,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = toDate(value)
  const minDate = min ? startOfDay(toDate(min) ?? new Date()) : undefined
  const maxDate = max ? startOfDay(toDate(max) ?? new Date()) : undefined
  const blocked: Matcher[] = []
  if (minDate) blocked.push({ before: minDate })
  if (maxDate) blocked.push({ after: maxDate })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        aria-label={ariaLabel}
        disabled={disabled}
        render={
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start font-normal",
              !selected && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon data-icon="inline-start" className="text-muted-foreground" />
        {selected ? format(selected, displayFormat) : placeholder}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto gap-0 rounded-2xl p-0">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? minDate ?? maxDate}
          onSelect={(day) => {
            onChange(day ? format(day, "yyyy-MM-dd") : "")
            setOpen(false)
          }}
          disabled={blocked.length ? blocked : undefined}
        />
      </PopoverContent>
    </Popover>
  )
}
