"use client"

import { useMemo } from "react"
import { format, setHours, setMinutes } from "date-fns"
import { SearchableSelect, type SelectOption } from "@/components/ui/searchable-select"

type TimePickerProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  /** Minute step between options. */
  step?: 5 | 10 | 15 | 30
  placeholder?: string
  disabled?: boolean
  className?: string
}

function buildTimeOptions(step: number): SelectOption[] {
  const options: SelectOption[] = []
  const base = new Date()
  for (let minutes = 0; minutes < 24 * 60; minutes += step) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    const label = format(setMinutes(setHours(base, h), m), "h:mm a")
    options.push({ value, label })
  }
  return options
}

/** Searchable time select storing values as `HH:mm` (24h). */
export function TimePicker({
  id,
  value,
  onChange,
  step = 15,
  placeholder = "Pick a time",
  disabled,
  className,
}: TimePickerProps) {
  const options = useMemo(() => {
    const list = buildTimeOptions(step)
    if (value && !list.some((o) => o.value === value)) {
      const [h, m] = value.split(":").map(Number)
      if (Number.isFinite(h) && Number.isFinite(m)) {
        const label = format(setMinutes(setHours(new Date(), h), m), "h:mm a")
        list.push({ value, label })
        list.sort((a, b) => a.value.localeCompare(b.value))
      }
    }
    return list
  }, [step, value])

  return (
    <SearchableSelect
      id={id}
      options={options}
      value={value || null}
      onValueChange={(next) => onChange(next ?? "")}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      emptyText="No matching time."
    />
  )
}
